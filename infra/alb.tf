# ---------------------------------------------------------------------------
# Application Load Balancer (ALB)
# Ponto de entrada público da aplicação. Distribui tráfego para as tasks ECS.
# ---------------------------------------------------------------------------

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false          # público (internet-facing)
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id # ALB precisa de ao menos 2 subnets em AZs diferentes

  # Proteção contra deleção acidental — remova antes de um `terraform destroy` real
  enable_deletion_protection = false

  tags = { Name = "${var.project_name}-alb" }
}

# ---------------------------------------------------------------------------
# Target Group
# Define como o ALB envia tráfego para os containers ECS e faz health check.
# ---------------------------------------------------------------------------

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-tg-backend"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # necessário para Fargate (não usa instance IDs)

  health_check {
    enabled             = true
    path                = "/stocks/catalog" # endpoint leve, sem autenticação, retorna JSON
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2   # 2 checks OK para marcar como healthy
    unhealthy_threshold = 3   # 3 falhas consecutivas para marcar como unhealthy
    timeout             = 5   # segundos para timeout de cada check
    interval            = 30  # segundos entre checks
    matcher             = "200" # espera HTTP 200
  }

  tags = { Name = "${var.project_name}-tg-backend" }
}

# ---------------------------------------------------------------------------
# Listener HTTP (porta 80)
# Para portfólio, mantemos só HTTP. Em produção real, adicione um listener
# HTTPS (443) com certificado ACM e redirecione o HTTP para HTTPS.
# ---------------------------------------------------------------------------

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ---------------------------------------------------------------------------
# [Opcional] Listener HTTPS — descomente quando tiver um certificado ACM
# ---------------------------------------------------------------------------
#
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = 443
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
#   certificate_arn   = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.backend.arn
#   }
# }
#
# # Redireciona HTTP → HTTPS
# resource "aws_lb_listener_rule" "http_redirect" {
#   listener_arn = aws_lb_listener.http.arn
#   priority     = 1
#
#   action {
#     type = "redirect"
#     redirect {
#       port        = "443"
#       protocol    = "HTTPS"
#       status_code = "HTTP_301"
#     }
#   }
#
#   condition {
#     path_pattern {
#       values = ["/*"]
#     }
#   }
# }
