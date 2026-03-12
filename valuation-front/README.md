PAINEL DE VALUATION (GRAHAM E BAZIN)

Uma aplicação Fullstack desenvolvida para automatizar a análise fundamentalista de ações da B3. O sistema coleta dados em tempo real e aplica as metodologias de valuation de Benjamin Graham (Preço Justo) e Décio Bazin (Preço Teto).

TECNOLOGIAS UTILIZADAS

Backend: Node.js, NestJS, TypeScript

Frontend: Next.js, React, TailwindCSS

Fonte de Dados: Yahoo Finance (via pacote yahoo-finance2)

O QUE VOCE PRECISA PARA RODAR (PRE-REQUISITOS)

Node.js instalado (versão 18 ou superior recomendada).

PASSO A PASSO PARA RODAR LOCALMENTE
O projeto é dividido em duas partes que precisam rodar simultaneamente: a API (Backend) e o Dashboard (Frontend). Você precisará abrir dois terminais.

PASSO 1: INICIANDO O BACKEND (API)

Abra o primeiro terminal e entre na pasta do backend:
cd valuation-api

Instale as dependências:
npm install

Crie um arquivo chamado .env na raiz da pasta valuation-api e defina a porta:
PORT=3000

Inicie o servidor:
npm run start:dev

(Deixe este terminal aberto. A API ficará rodando em http://localhost:3000)

PASSO 2: INICIANDO O FRONTEND (DASHBOARD)

Abra um SEGUNDO terminal e entre na pasta do frontend:
cd valuation-front

Instale as dependências:
npm install

Crie um arquivo chamado .env.local na raiz da pasta valuation-front e aponte para a API:
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3000

Inicie o servidor da interface:
npm run dev

PASSO 3: ACESSANDO O PAINEL
Abra o seu navegador e acesse: http://localhost:3001
Ao abrir a página, o sistema já fará a busca automática de uma carteira padrão de dividendos.

FORMULAS UTILIZADAS NOS CALCULOS

Preço Teto (Bazin): Média de Dividendos (5 anos) / 0.06

Preço Justo (Graham): Raiz Quadrada de (22.5 _ LPA _ VPA)

Preco Justo Ajustado: Preço Justo - 30% (Prêmio de Risco)

Margem de Segurança: (Preço Justo - Preço Atual) / Preço Justo

Potencial de Valorização: (Preço Justo - Preço Atual) / Preço Atual

ARVORE DE DECISÃO (CLASSIFICACAO DE APORTES)

Aporte Forte: Valor Atual menor que Preço Justo Ajustado

Aporte: Valor Atual menor que Preço Justo

Aporte Pequeno: Valor Atual menor que Preço Teto

Não Comprar: Valor Atual maior que Preço Teto
