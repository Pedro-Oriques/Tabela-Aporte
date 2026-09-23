# ---------------------------------------------------------------------------
# Variáveis globais
# ---------------------------------------------------------------------------

variable "project_name" {
  description = "Nome do projeto — usado como prefixo em todos os recursos AWS."
  type        = string
  default     = "invs"
}

variable "environment" {
  description = "Ambiente de deploy (production, staging)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "O ambiente deve ser 'production' ou 'staging'."
  }
}

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados."
  type        = string
  default     = "us-east-1"
}

# ---------------------------------------------------------------------------
# Rede
# ---------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block da VPC principal."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas (uma por AZ). O ALB precisa de no mínimo 2."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs das subnets privadas (uma por AZ). O ECS Fargate roda aqui."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# ---------------------------------------------------------------------------
# ECS / Container
# ---------------------------------------------------------------------------

variable "backend_port" {
  description = "Porta em que o container NestJS escuta internamente."
  type        = number
  default     = 3000
}

variable "backend_cpu" {
  description = "CPU alocada para a task Fargate em unidades vCPU × 1024. Ex: 256 = 0.25 vCPU."
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memória alocada para a task Fargate em MB."
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Número de tasks ECS rodando simultaneamente."
  type        = number
  default     = 1
}

variable "backend_image_tag" {
  description = "Tag da imagem Docker usada no deploy inicial. O CI/CD sobrescreve via variável de ambiente."
  type        = string
  default     = "latest"
}

# ---------------------------------------------------------------------------
# Segredos — NÃO coloque valores reais aqui. Use terraform.tfvars (não commitado).
# ---------------------------------------------------------------------------

variable "database_url" {
  description = "Connection string completa do MongoDB Atlas. Ex: mongodb+srv://user:pass@cluster.mongodb.net/invs"
  type        = string
  sensitive   = true
}

variable "brapi_token" {
  description = "Token de API da BRAPI para cotações de ações brasileiras."
  type        = string
  sensitive   = true
}

variable "admin_api_key" {
  description = "Chave de API para endpoints administrativos protegidos (ex: /stocks/cache)."
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Origins permitidas pelo CORS, separadas por vírgula. Ex: https://meu-app.vercel.app"
  type        = string
  default     = "https://seu-dominio.vercel.app"
}
