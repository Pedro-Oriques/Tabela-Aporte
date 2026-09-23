# ---------------------------------------------------------------------------
# CloudWatch Log Group
# Os logs do container NestJS são enviados automaticamente para cá.
# Retention de 30 dias para evitar custos de armazenamento indefinido.
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}/backend"
  retention_in_days = 30

  tags = { Name = "${var.project_name}-logs-backend" }
}

# ---------------------------------------------------------------------------
# ECS Cluster
# Agrupa os serviços e tasks do projeto. Fargate não requer instâncias EC2.
# Container Insights ativado para métricas detalhadas de CPU/memória no CloudWatch.
# ---------------------------------------------------------------------------

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = "${var.project_name}-ecs-cluster" }
}

# ---------------------------------------------------------------------------
# ECS Task Definition
# Define o "blueprint" do container: imagem, recursos, variáveis de ambiente
# e onde enviar os logs. Cada novo deploy registra uma nova revisão.
# ---------------------------------------------------------------------------

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc" # obrigatório para Fargate
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn # pull de imagem + secrets
  task_role_arn            = aws_iam_role.ecs_task.arn           # permissões da aplicação

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.backend_port
          hostPort      = var.backend_port
          protocol      = "tcp"
        }
      ]

      # Variáveis de ambiente não-sensíveis injetadas diretamente
      environment = [
        { name = "PORT",             value = tostring(var.backend_port) },
        { name = "NODE_ENV",         value = "production" },
        { name = "ALLOWED_ORIGINS",  value = var.allowed_origins }
      ]

      # Variáveis sensíveis lidas do Secrets Manager em tempo de bootstrap.
      # O ECS injeta o valor como env var — o código não sabe a diferença.
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        },
        {
          name      = "BRAPI_TOKEN"
          valueFrom = aws_secretsmanager_secret.brapi_token.arn
        },
        {
          name      = "ADMIN_API_KEY"
          valueFrom = aws_secretsmanager_secret.admin_api_key.arn
        }
      ]

      # Logs enviados para o CloudWatch via driver awslogs
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      # Health check interno do container (complementa o health check do ALB)
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.backend_port}/stocks/catalog || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60 # aguarda 60s para o NestJS inicializar antes de começar os checks
      }
    }
  ])

  tags = { Name = "${var.project_name}-task-def-backend" }
}

# ---------------------------------------------------------------------------
# ECS Service
# Mantém o número desejado de tasks rodando e faz rolling deploy automaticamente.
# Circuit breaker integrado: reverte para a versão anterior se o novo deploy falhar.
# ---------------------------------------------------------------------------

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  # Durante um deploy, mantém ao menos 100% das tasks rodando antes de subir as novas.
  # Sobe até 200% temporariamente para zero-downtime deployment.
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  # Circuit breaker: se o rolling deploy falhar repetidamente, ECS reverte automaticamente
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = aws_subnet.private[*].id     # tasks ficam em subnets privadas
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false # sem IP público — tráfego de saída pelo NAT Gateway
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.backend_port
  }

  # Garante que o ALB e o target group estejam prontos antes de subir as tasks
  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_task_execution_policy
  ]

  # Ignora mudanças na task_definition pois o CI/CD gerencia as atualizações de imagem
  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = { Name = "${var.project_name}-ecs-service-backend" }
}
