# ---------------------------------------------------------------------------
# Outputs — valores exportados após o `terraform apply`
# Usados pelo CI/CD (GitHub Actions) e para configurar o frontend no Vercel
# ---------------------------------------------------------------------------

output "alb_dns_name" {
  description = "DNS público do Application Load Balancer. Use como valor de NEXT_PUBLIC_API_URL no Vercel (acrescente /stocks)."
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_repository_url" {
  description = "URL do repositório ECR. Use no CI/CD para fazer docker push."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS. Necessário no workflow de deploy para o comando `aws ecs update-service`."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nome do serviço ECS. Necessário no workflow de deploy para o comando `aws ecs update-service`."
  value       = aws_ecs_service.backend.name
}

output "github_actions_role_arn" {
  description = "ARN da IAM Role para o GitHub Actions usar via OIDC. Configure como secret AWS_ROLE_ARN no repositório."
  value       = aws_iam_role.github_actions.arn
}

output "vpc_id" {
  description = "ID da VPC criada."
  value       = aws_vpc.main.id
}
