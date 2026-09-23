# ---------------------------------------------------------------------------
# IAM — Roles e Policies com princípio de menor privilégio
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# ECS Task Execution Role
# Usada pelo ECS Agent para:
#   - Puxar imagens do ECR
#   - Escrever logs no CloudWatch
#   - Ler segredos do Secrets Manager durante o bootstrap da task
# ---------------------------------------------------------------------------

resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = { Name = "${var.project_name}-ecs-execution-role" }
}

# Policy gerenciada pela AWS que cobre pull de imagem ECR + logs CloudWatch
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Policy customizada para leitura dos segredos específicos deste projeto no Secrets Manager
resource "aws_iam_role_policy" "ecs_secrets_read" {
  name = "${var.project_name}-ecs-secrets-read"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        # Restringe o acesso apenas aos segredos deste projeto (least privilege)
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/*"
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# ECS Task Role
# Permissões que o código da aplicação (NestJS) usa em runtime.
# Por enquanto não precisa de permissões AWS especiais, mas a role é criada
# para facilitar futuras adições (ex: S3, SQS).
# ---------------------------------------------------------------------------

resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = { Name = "${var.project_name}-ecs-task-role" }
}

# ---------------------------------------------------------------------------
# GitHub Actions OIDC Role
# Permite que o CI/CD do GitHub Actions faça deploy na AWS
# sem armazenar access keys permanentes como secrets do repositório.
# Usa OpenID Connect (OIDC) — o método recomendado pela AWS para CI/CD.
# ---------------------------------------------------------------------------

# Provider OIDC do GitHub — registrado uma vez por conta AWS
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # Thumbprint do certificado TLS do GitHub Actions
  # Ref: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions-role"

  # Trust policy: permite apenas o repositório configurado em `allowed_origins`
  # usar esta role via OIDC, evitando que outras repos da mesma conta se aproveitem dela.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Substitua pelo seu usuário/repositório GitHub real
            # Exemplo: "repo:seu-usuario/invs:*"
            "token.actions.githubusercontent.com:sub" = "repo:seu-usuario/${var.project_name}:*"
          }
        }
      }
    ]
  })

  tags = { Name = "${var.project_name}-github-actions-role" }
}

# Permissões do CI/CD: push para ECR + deploy no ECS
resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "${var.project_name}-github-actions-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Autenticação com o ECR (necessário antes do docker push)
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      # Operações no repositório ECR específico deste projeto
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = aws_ecr_repository.backend.arn
      },
      # Deploy no ECS: atualizar o service com a nova imagem
      {
        Effect = "Allow"
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:DescribeTasks",
          "ecs:ListTasks"
        ]
        Resource = "*"
      },
      # Passar roles para o ECS durante o deploy
      {
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = [
          aws_iam_role.ecs_task_execution.arn,
          aws_iam_role.ecs_task.arn
        ]
      }
    ]
  })
}
