# ---------------------------------------------------------------------------
# AWS Secrets Manager
# Armazena as variáveis de ambiente sensíveis do backend NestJS.
# O ECS injeta os segredos diretamente no container — nenhum valor sensível
# fica no código, no estado do Terraform ou nos logs do CI/CD.
# ---------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/database-url"
  description             = "Connection string do MongoDB Atlas"
  recovery_window_in_days = 7 # período de recuperação antes da exclusão permanente
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}

resource "aws_secretsmanager_secret" "brapi_token" {
  name                    = "${var.project_name}/brapi-token"
  description             = "Token de API da BRAPI para cotações B3"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "brapi_token" {
  secret_id     = aws_secretsmanager_secret.brapi_token.id
  secret_string = var.brapi_token
}

resource "aws_secretsmanager_secret" "admin_api_key" {
  name                    = "${var.project_name}/admin-api-key"
  description             = "Chave de API para rotas administrativas (cache refresh, clear)"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "admin_api_key" {
  secret_id     = aws_secretsmanager_secret.admin_api_key.id
  secret_string = var.admin_api_key
}
