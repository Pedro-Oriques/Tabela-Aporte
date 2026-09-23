# ---------------------------------------------------------------------------
# ECR — Elastic Container Registry
# Armazena as imagens Docker do backend. O CI/CD faz push para cá a cada deploy.
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE" # permite sobrescrever a tag "latest" a cada deploy

  # Scan automático de vulnerabilidades em cada push
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Name = "${var.project_name}-ecr-backend" }
}

# ---------------------------------------------------------------------------
# Lifecycle policy — mantém apenas as 10 imagens mais recentes
# para evitar acúmulo de imagens antigas e cobranças de armazenamento
# ---------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Manter apenas as 10 imagens mais recentes"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
