terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Descomente e configure este bloco para armazenar o state remotamente no S3.
  # Requer que o bucket e a tabela DynamoDB já existam antes do primeiro `terraform init`.
  #
  # backend "s3" {
  #   bucket         = "meu-projeto-terraform-state"
  #   key            = "invs/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ---------------------------------------------------------------------------
# Data sources
# ---------------------------------------------------------------------------

# Obtém as availability zones disponíveis na região configurada.
data "aws_availability_zones" "available" {
  state = "available"
}

# Obtém o ID da conta AWS atual (usado em ARNs e policies).
data "aws_caller_identity" "current" {}
