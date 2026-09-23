# Painel de Valuation B3

> Ferramenta de análise fundamentalista de ações brasileiras aplicando as metodologias de **Benjamin Graham** (Preço Justo) e **Décio Bazin** (Preço Teto). Dados coletados em tempo real via Yahoo Finance e BRAPI.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Terraform](https://img.shields.io/badge/Terraform-AWS-7B42BC?style=flat&logo=terraform)](infra/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=github-actions)](.github/workflows/)

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Fórmulas de Valuation](#fórmulas-de-valuation)
- [Rodando Localmente](#rodando-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API Reference](#api-reference)
- [Infraestrutura AWS (Terraform)](#infraestrutura-aws-terraform)
- [CI/CD](#cicd)
- [Estrutura do Repositório](#estrutura-do-repositório)

---

## Visão Geral

| Camada    | Tecnologia             | Responsabilidade                                      |
|-----------|------------------------|-------------------------------------------------------|
| Frontend  | Next.js 16 + React 19  | Dashboard interativo com ranking e ficha de cada ação |
| Backend   | NestJS 11 + TypeScript | API REST, coleta de dados, cálculo de valuation       |
| Banco     | MongoDB (via Prisma)   | Cache das valuations calculadas                       |
| Infra     | AWS ECS Fargate + ALB  | Hosting do backend em container serverless            |
| Deploy    | GitHub Actions + Vercel | CI/CD automatizado para frontend e backend            |

---

## Funcionalidades

- **Valuation por Graham**: calcula o Preço Justo com base em LPA e VPA
- **Valuation por Bazin**: calcula o Preço Teto com base na média de dividendos dos últimos 5 anos
- **Classificação automática**: categoriza cada ação em Aporte Forte, Aporte, Aporte Pequeno ou Não Comprar
- **Ranking de ações**: top ações por potencial de valorização, dividend yield e classificação geral
- **Cache diário**: job agendado atualiza as valuations todos os dias às 10h, evitando excesso de requisições às APIs externas
- **Busca e catálogo**: pesquisa de ações por ticker, nome ou setor
- **Rate limiting**: throttle global de 100 requisições por minuto por IP

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                     Usuário                         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Vercel (Frontend)                      │
│         Next.js 16 — App Router + SSR               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────┐
│         AWS Application Load Balancer               │
│              (porta 80 / 443)                       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│        AWS ECS Fargate — Subnet Privada             │
│         NestJS 11  •  porta 3000                    │
│                                                     │
│  ┌─────────────┐    ┌────────────────────────────┐  │
│  │  Throttler  │    │     StocksService          │  │
│  │  (100/min)  │    │  Graham + Bazin calculator │  │
│  └─────────────┘    └──────────────┬─────────────┘  │
│                                    │                 │
│  ┌─────────────────────────────────▼─────────────┐  │
│  │           StocksCacheJob (cron 10h)           │  │
│  │   Yahoo Finance API ◄──────────► BRAPI API    │  │
│  └─────────────────────────────────┬─────────────┘  │
└───────────────────────────────────-│-───────────────┘
                                     │ NAT Gateway
┌────────────────────────────────────▼────────────────┐
│             MongoDB Atlas (externo)                 │
│   Collections: stock_cache  •  planilha_cache       │
└─────────────────────────────────────────────────────┘

AWS Secrets Manager ──► DATABASE_URL, BRAPI_TOKEN, ADMIN_API_KEY
AWS ECR             ──► Registry das imagens Docker do backend
```

---

## Fórmulas de Valuation

### Graham — Preço Justo

Estima o valor intrínseco da ação com base nos fundamentos da empresa:

```
Preço Justo = √(22.5 × LPA × VPA)

Preço Justo Ajustado = Preço Justo × (1 - 0.30)   ← prêmio de risco de 30%

Margem de Segurança = (Preço Justo - Valor Atual) / Preço Justo

Potencial de Valorização = (Preço Justo - Valor Atual) / Valor Atual
```

Onde:
- **LPA** = Lucro Por Ação (EPS)
- **VPA** = Valor Patrimonial Por Ação (Book Value Per Share)
- **22.5** = constante de Graham (P/L × P/VP = 22.5)

### Bazin — Preço Teto

Estima o valor máximo a pagar para obter um rendimento mínimo de dividendos:

```
Preço Teto = Média de Dividendos (5 anos) / 0.06

Distância do Preço Teto = (Preço Teto - Valor Atual) / Preço Teto
```

### Árvore de Decisão — Classificação de Aportes

```
Valor Atual < Preço Justo Ajustado  →  ✅ Aporte Forte
Valor Atual < Preço Justo           →  🟡 Aporte
Valor Atual < Preço Teto            →  🟠 Aporte Pequeno
Valor Atual ≥ Preço Teto            →  🔴 Não Comprar
```

---

## Rodando Localmente

### Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [MongoDB local](https://www.mongodb.com/try/download/community) ou [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- Token BRAPI: [brapi.dev](https://brapi.dev) (gratuito)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/invs.git
cd invs
```

### 2. Configure o backend

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com seus valores:

```env
PORT=3000
DATABASE_URL="mongodb://localhost:27017/invs"
BRAPI_TOKEN=seu-token-aqui
ADMIN_API_KEY=qualquer-chave-local
ALLOWED_ORIGINS=http://localhost:3001
```

```bash
npm install
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

### 3. Configure o frontend

```bash
cd ../frontend
cp .env.local.example .env.local   # se existir, ou crie manualmente
```

Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

O dashboard estará disponível em `http://localhost:3001`.

> O job de cache roda automaticamente às 10h. Para popular o banco imediatamente, faça uma requisição autenticada para `POST /stocks/cache/refresh` com o header `x-api-key: seu-ADMIN_API_KEY`.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável          | Obrigatória | Descrição                                                        |
|-------------------|:-----------:|------------------------------------------------------------------|
| `PORT`            | Não         | Porta do servidor. Default: `3000`                               |
| `DATABASE_URL`    | ✅           | Connection string do MongoDB                                     |
| `BRAPI_TOKEN`     | ✅           | Token da API BRAPI para cotações B3. Obtenha em brapi.dev        |
| `ADMIN_API_KEY`   | ✅           | Chave para rotas administrativas (`/stocks/cache`, `/stocks/cache/refresh`) |
| `ALLOWED_ORIGINS` | Não         | Origins para CORS, separadas por vírgula. Default: `http://localhost:3001` |
| `NODE_ENV`        | Não         | `production` em deploy, `development` localmente                 |

### Frontend (`frontend/.env.local`)

| Variável               | Obrigatória | Descrição                                        |
|------------------------|:-----------:|--------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | ✅           | URL base do backend. Ex: `http://localhost:3000` |

---

## API Reference

Todos os endpoints são públicos exceto os marcados com 🔒, que exigem o header `x-api-key: <ADMIN_API_KEY>`.

### Ações

| Método   | Rota                          | Descrição                                        |
|----------|-------------------------------|--------------------------------------------------|
| `GET`    | `/stocks/catalog`             | Lista todas as ações do catálogo                 |
| `GET`    | `/stocks/search?q=<query>`    | Busca ações por ticker, nome ou setor (mín. 2 chars) |
| `GET`    | `/stocks/valuation/:ticker`   | Retorna a valuation completa de uma ação         |
| `GET`    | `/stocks/planilha/:ticker`    | Retorna dados da planilha de suporte              |

### Rankings

| Método   | Rota                              | Descrição                                         |
|----------|-----------------------------------|---------------------------------------------------|
| `GET`    | `/stocks/ranking/potential?limit=` | Top ações por potencial de valorização (Graham)   |
| `GET`    | `/stocks/ranking/yield?limit=`     | Top ações por média de dividendos (Bazin)         |
| `GET`    | `/stocks/ranking/best?limit=`      | Top ações com classificação "Aporte Forte"        |

### Administração

| Método   | Rota                    | Autenticação | Descrição                             |
|----------|-------------------------|:------------:|---------------------------------------|
| `POST` 🔒 | `/stocks/cache/refresh` | x-api-key    | Dispara ciclo de atualização do cache |
| `DELETE` 🔒 | `/stocks/cache`       | x-api-key    | Limpa todo o cache do banco           |

**Exemplo de request autenticado:**
```bash
curl -X POST http://localhost:3000/stocks/cache/refresh \
  -H "x-api-key: seu-ADMIN_API_KEY"
```

---

## Infraestrutura AWS (Terraform)

A infra completa está em `infra/` e provisiona os seguintes recursos na AWS:

```
infra/
├── main.tf                  # Provider AWS e configuração do state remoto
├── variables.tf             # Todas as variáveis com descrição e validação
├── outputs.tf               # Valores exportados após o apply (URLs, ARNs)
├── vpc.tf                   # VPC, subnets, NAT Gateway, security groups
├── ecr.tf                   # Registry Docker com lifecycle policy
├── iam.tf                   # Roles IAM com least privilege + OIDC para GitHub Actions
├── secrets.tf               # AWS Secrets Manager para variáveis sensíveis
├── alb.tf                   # Application Load Balancer + target group + health check
├── ecs.tf                   # Cluster ECS, task definition e service com circuit breaker
├── terraform.tfvars.example # Template de variáveis (commitar)
└── .gitignore               # Protege state, tfvars e credenciais
```

### Recursos provisionados

| Recurso                   | Descrição                                                           |
|---------------------------|---------------------------------------------------------------------|
| **VPC**                   | Rede isolada com subnets públicas (ALB) e privadas (ECS)            |
| **NAT Gateway**           | Permite que tasks privadas acessem internet (Yahoo Finance, BRAPI)  |
| **ECR Repository**        | Registry das imagens Docker com scan de vulnerabilidades e lifecycle |
| **ECS Fargate Cluster**   | Orquestração de containers sem servidor para gerenciar               |
| **ECS Task Definition**   | Blueprint do container com secrets injetados pelo Secrets Manager    |
| **ECS Service**           | Mantém tasks rodando com rolling deploy e circuit breaker           |
| **Application Load Balancer** | Ponto de entrada público com health check                       |
| **Secrets Manager**       | DATABASE_URL, BRAPI_TOKEN e ADMIN_API_KEY armazenados com criptografia |
| **IAM Roles**             | Task execution role (pull ECR + read secrets) e OIDC role para CI/CD |
| **CloudWatch Logs**       | Logs do container com retenção de 30 dias                           |

### Aplicando a infraestrutura

> **Pré-requisitos**: Terraform >= 1.6, AWS CLI configurado com credenciais de administrador.

```bash
cd infra

# 1. Copie e preencha as variáveis
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com seus valores reais

# 2. Inicialize o Terraform (baixa providers e módulos)
terraform init

# 3. Visualize o que será criado (nenhuma mudança real)
terraform plan

# 4. Aplique a infraestrutura
terraform apply

# 5. Anote os outputs — serão usados no CI/CD
terraform output
```

### Outputs importantes

Após o `terraform apply`, anote:

| Output                    | Onde usar                                          |
|---------------------------|----------------------------------------------------|
| `alb_dns_name`            | `NEXT_PUBLIC_API_URL` no Vercel                    |
| `ecr_repository_url`      | `ECR_REPOSITORY` no workflow de deploy             |
| `ecs_cluster_name`        | `ECS_CLUSTER` no workflow de deploy                |
| `ecs_service_name`        | `ECS_SERVICE` no workflow de deploy                |
| `github_actions_role_arn` | `AWS_ROLE_ARN` nos secrets do repositório GitHub   |

### Destruindo a infraestrutura

```bash
# Remove todos os recursos criados (irreversível — dados do banco externos não são afetados)
terraform destroy
```

---

## CI/CD

Dois pipelines independentes em `.github/workflows/`:

### Backend (`backend-deploy.yml`)

Disparado em push para `main` com mudanças em `backend/`:

```
Push → Testes (Jest) → Build Docker → Push ECR → Deploy ECS → Aguarda estabilização
                                         ↑
                              SHA do commit como tag da imagem
```

**Secrets necessários no repositório GitHub:**

| Secret           | Valor                                                    |
|------------------|----------------------------------------------------------|
| `AWS_ROLE_ARN`   | ARN da IAM Role (output `github_actions_role_arn`)       |
| `ALB_DNS_NAME`   | DNS do ALB (output `alb_dns_name`, sem o `http://`)      |

> A autenticação AWS usa **OIDC** — não são necessárias access keys permanentes.

### Frontend (`frontend-deploy.yml`)

Disparado em push para `main` com mudanças em `frontend/`:

```
Push → Build Next.js → Deploy Vercel
```

**Secrets necessários:**

| Secret          | Valor                                    |
|-----------------|------------------------------------------|
| `VERCEL_TOKEN`  | Token gerado em vercel.com/account/tokens |

Configure também no painel do Vercel:

| Variável de Ambiente    | Valor                       |
|-------------------------|-----------------------------|
| `NEXT_PUBLIC_API_URL`   | `http://<alb_dns_name>`     |

---

## Estrutura do Repositório

```
invs/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── guards/             # ApiKeyGuard para rotas administrativas
│   │   ├── prisma/             # PrismaService e PrismaModule
│   │   └── stocks/
│   │       ├── stocks.controller.ts    # Endpoints REST
│   │       ├── stocks.service.ts       # Lógica de valuation (Graham + Bazin)
│   │       ├── stocks.data.ts          # Catálogo de ações B3
│   │       ├── stocks.types.ts         # Interfaces TypeScript
│   │       ├── stocks-cache.job.ts     # Job agendado (cron 10h)
│   │       ├── brapi.service.ts        # Integração BRAPI (cotações)
│   │       ├── yahoo.service.ts        # Integração Yahoo Finance (LPA, VPA, dividendos)
│   │       └── planilha.service.ts     # Planilha de suporte ao valuation
│   ├── prisma/schema.prisma    # Schema MongoDB (StockCache, PlanilhaCache)
│   └── .env.example            # Template de variáveis de ambiente
│
├── frontend/                   # Dashboard Next.js
│   ├── app/
│   │   ├── page.tsx            # Página inicial (ranking)
│   │   ├── dashboard/          # Dashboard principal
│   │   └── stocks/             # Listagem de ações
│   ├── components/
│   │   ├── dashboard/          # Componentes do painel (tabelas, drawers, widgets)
│   │   └── ...                 # Componentes compartilhados
│   └── lib/
│       ├── api.ts              # Client HTTP para o backend
│       └── types.ts            # Tipos TypeScript compartilhados
│
├── infra/                      # Infraestrutura AWS com Terraform
│   ├── main.tf                 # Provider e backend de state
│   ├── variables.tf            # Variáveis com validação
│   ├── outputs.tf              # Outputs pós-apply
│   ├── vpc.tf                  # Rede
│   ├── ecr.tf                  # Registry Docker
│   ├── iam.tf                  # IAM roles + OIDC
│   ├── secrets.tf              # Secrets Manager
│   ├── alb.tf                  # Load Balancer
│   ├── ecs.tf                  # ECS Fargate
│   └── terraform.tfvars.example
│
└── .github/
    └── workflows/
        ├── backend-deploy.yml  # CI/CD backend → ECR → ECS
        └── frontend-deploy.yml # CI/CD frontend → Vercel
```

---

## Licença

MIT
