export interface StockValuation {
  ticker: string;
  valorAtual: number;
  mediaDividendos5Anos: number;
  ultimoDividendo: number;
  lpa: number;
  vpa: number;
  rendimentoDesejado: number;
  precoTeto: number;
  graham: number;
  precoJusto: number;
  premioDeRisco: number;
  precoJustoAjustado: number;
  margemSeguranca: number;
  margemSegurancaAjustada: number;
  distanciaPrecoTeto: number;
  potencialValorizacao: number;
  classificacaoAporte: string;
}

export interface StockSearchResult {
  ticker: string;
  nome: string;
  setor: string;
}

export interface StockRankingItem {
  ticker: string;
  nome: string;
  setor: string;
  valorAtual: number;
  potencialValorizacao: number;
  mediaDividendos5Anos: number;
  classificacaoAporte: string;
}

export interface StockPlanilha {
  ticker: string;
  dy: number | null;
  crescimentoLucro: number | null;
  pl: number | null;
  pvpTimesPl: number | null;
  margemLiquida: number | null;
  roe: number | null;
  dividaLiquidaEbitda: number | null;
  acaoVsInflacao: boolean | null;
}
