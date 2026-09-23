# ---------------------------------------------------------------------------
# VPC — rede isolada para toda a infraestrutura do projeto
# ---------------------------------------------------------------------------

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true # necessário para o ECS resolver nomes internos
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

# ---------------------------------------------------------------------------
# Internet Gateway — permite tráfego de entrada/saída para subnets públicas
# ---------------------------------------------------------------------------

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "${var.project_name}-igw" }
}

# ---------------------------------------------------------------------------
# Subnets públicas — ALB fica aqui, exposto à internet
# ---------------------------------------------------------------------------

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true # instâncias nessa subnet recebem IP público automaticamente

  tags = { Name = "${var.project_name}-public-${count.index + 1}" }
}

# ---------------------------------------------------------------------------
# Subnets privadas — ECS Fargate roda aqui, sem IP público
# ---------------------------------------------------------------------------

resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = { Name = "${var.project_name}-private-${count.index + 1}" }
}

# ---------------------------------------------------------------------------
# Elastic IP + NAT Gateway — permite que as tasks privadas façam requests
# de saída (para Yahoo Finance, BRAPI, MongoDB Atlas) sem ter IP público
# ---------------------------------------------------------------------------

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = { Name = "${var.project_name}-nat-eip" }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # NAT fica na subnet pública para ter saída pela IGW

  tags = { Name = "${var.project_name}-nat" }
}

# ---------------------------------------------------------------------------
# Route Tables
# ---------------------------------------------------------------------------

# Tabela de rota pública: qualquer tráfego de saída vai para a IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-rt-public" }
}

# Tabela de rota privada: tráfego de saída vai pelo NAT Gateway
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = { Name = "${var.project_name}-rt-private" }
}

# Associa cada subnet pública à tabela de rota pública
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Associa cada subnet privada à tabela de rota privada
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ---------------------------------------------------------------------------
# Security Groups
# ---------------------------------------------------------------------------

# ALB: aceita tráfego HTTP/HTTPS de qualquer origem (internet)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-sg-alb"
  description = "Permite trafego HTTP/HTTPS de entrada para o ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permite todo tráfego de saída (necessário para health checks e redirecionamentos)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-alb" }
}

# ECS Tasks: aceita tráfego apenas do ALB (sem exposição direta à internet)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-sg-ecs"
  description = "Permite trafego apenas do ALB para os containers ECS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Trafego do ALB para o backend NestJS"
    from_port       = var.backend_port
    to_port         = var.backend_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id] # restringe ao SG do ALB
  }

  # Permite saída livre: tasks precisam acessar MongoDB Atlas, Yahoo Finance e BRAPI
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-ecs" }
}
