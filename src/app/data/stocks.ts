export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  avg5Years: number;
  lpa: number;
  vpa: number;
  dividendYield: number;
  ceiling: number;
  graham: number;
  fairPrice: number;
  risk: number;
  adjustedFairPrice: number;
  marginOfSafety: number;
  adjustedMargin: number;
  distanceToCeiling: number;
  potential: number;
  classification: 'APORTE FORTE' | 'APORTE' | 'APORTE PEQUENO' | 'NÃO COMPRAR';
}

// Lista completa de ações disponíveis
export const ALL_STOCKS: Omit<Stock, 'classification' | 'potential' | 'distanceToCeiling' | 'adjustedMargin' | 'marginOfSafety' | 'adjustedFairPrice' | 'risk' | 'fairPrice' | 'graham' | 'ceiling'>[] = [
  { id: '1', ticker: 'ITUB4', name: 'Itaú Unibanco', sector: 'Bancos', currentPrice: 28.50, avg5Years: 26.80, lpa: 3.20, vpa: 18.50, dividendYield: 4.2 },
  { id: '2', ticker: 'PETR4', name: 'Petrobras', sector: 'Petróleo e Gás', currentPrice: 36.80, avg5Years: 28.90, lpa: 8.40, vpa: 42.10, dividendYield: 12.5 },
  { id: '3', ticker: 'VALE3', name: 'Vale', sector: 'Mineração', currentPrice: 61.20, avg5Years: 58.40, lpa: 12.80, vpa: 55.30, dividendYield: 9.8 },
  { id: '4', ticker: 'BBDC4', name: 'Bradesco', sector: 'Bancos', currentPrice: 13.80, avg5Years: 16.20, lpa: 2.10, vpa: 22.40, dividendYield: 5.8 },
  { id: '5', ticker: 'ABEV3', name: 'Ambev', sector: 'Bebidas', currentPrice: 12.40, avg5Years: 13.10, lpa: 0.85, vpa: 3.20, dividendYield: 4.5 },
  { id: '6', ticker: 'WEGE3', name: 'WEG', sector: 'Máquinas e Equipamentos', currentPrice: 42.80, avg5Years: 32.50, lpa: 1.85, vpa: 12.30, dividendYield: 1.2 },
  { id: '7', ticker: 'BBAS3', name: 'Banco do Brasil', sector: 'Bancos', currentPrice: 28.90, avg5Years: 32.40, lpa: 5.20, vpa: 38.70, dividendYield: 7.3 },
  { id: '8', ticker: 'RENT3', name: 'Localiza', sector: 'Aluguel de Carros', currentPrice: 58.30, avg5Years: 48.20, lpa: 3.50, vpa: 28.40, dividendYield: 1.8 },
  { id: '9', ticker: 'GGBR4', name: 'Gerdau', sector: 'Siderurgia', currentPrice: 21.70, avg5Years: 19.80, lpa: 3.40, vpa: 18.90, dividendYield: 6.2 },
  { id: '10', ticker: 'SUZB3', name: 'Suzano', sector: 'Papel e Celulose', currentPrice: 52.40, avg5Years: 46.30, lpa: 8.70, vpa: 62.10, dividendYield: 3.4 },
  { id: '11', ticker: 'RAIL3', name: 'Rumo', sector: 'Transporte', currentPrice: 19.80, avg5Years: 17.20, lpa: 1.20, vpa: 12.40, dividendYield: 2.1 },
  { id: '12', ticker: 'CSAN3', name: 'Cosan', sector: 'Holding', currentPrice: 14.50, avg5Years: 16.80, lpa: 1.90, vpa: 22.30, dividendYield: 3.2 },
  { id: '13', ticker: 'JBSS3', name: 'JBS', sector: 'Alimentos', currentPrice: 32.10, avg5Years: 28.40, lpa: 5.40, vpa: 24.80, dividendYield: 4.8 },
  { id: '14', ticker: 'EQTL3', name: 'Equatorial', sector: 'Energia Elétrica', currentPrice: 38.70, avg5Years: 32.10, lpa: 3.80, vpa: 26.50, dividendYield: 5.1 },
  { id: '15', ticker: 'CPLE6', name: 'Copel', sector: 'Energia Elétrica', currentPrice: 8.90, avg5Years: 7.40, lpa: 1.20, vpa: 12.80, dividendYield: 8.2 },
  { id: '16', ticker: 'VIVT3', name: 'Telefônica Brasil', sector: 'Telecomunicações', currentPrice: 48.20, avg5Years: 42.30, lpa: 4.10, vpa: 28.90, dividendYield: 6.8 },
  { id: '17', ticker: 'EMBR3', name: 'Embraer', sector: 'Aeronáutica', currentPrice: 42.50, avg5Years: 18.30, lpa: 2.80, vpa: 32.40, dividendYield: 1.5 },
  { id: '18', ticker: 'TAEE11', name: 'Taesa', sector: 'Energia Elétrica', currentPrice: 36.40, avg5Years: 33.20, lpa: 2.90, vpa: 18.70, dividendYield: 7.9 },
  { id: '19', ticker: 'BRFS3', name: 'BRF', sector: 'Alimentos', currentPrice: 18.60, avg5Years: 21.40, lpa: 1.40, vpa: 28.30, dividendYield: 2.3 },
  { id: '20', ticker: 'ENEV3', name: 'Eneva', sector: 'Energia Elétrica', currentPrice: 12.80, avg5Years: 11.20, lpa: 1.80, vpa: 14.60, dividendYield: 4.7 },
  { id: '21', ticker: 'RADL3', name: 'Raia Drogasil', sector: 'Varejo Farmacêutico', currentPrice: 24.30, avg5Years: 22.80, lpa: 1.30, vpa: 8.90, dividendYield: 2.8 },
  { id: '22', ticker: 'MGLU3', name: 'Magazine Luiza', sector: 'Varejo', currentPrice: 3.20, avg5Years: 8.40, lpa: -0.40, vpa: 4.80, dividendYield: 0.0 },
  { id: '23', ticker: 'KLBN11', name: 'Klabin', sector: 'Papel e Celulose', currentPrice: 22.80, avg5Years: 20.40, lpa: 2.40, vpa: 18.30, dividendYield: 3.9 },
  { id: '24', ticker: 'LREN3', name: 'Lojas Renner', sector: 'Varejo', currentPrice: 16.40, avg5Years: 18.90, lpa: 1.10, vpa: 9.20, dividendYield: 3.1 },
  { id: '25', ticker: 'MULT3', name: 'Multiplan', sector: 'Shopping Centers', currentPrice: 24.50, avg5Years: 22.10, lpa: 1.80, vpa: 16.40, dividendYield: 6.5 },
];

// Função para calcular métricas e classificação
export function calculateMetrics(stock: Omit<Stock, 'classification' | 'potential' | 'distanceToCeiling' | 'adjustedMargin' | 'marginOfSafety' | 'adjustedFairPrice' | 'risk' | 'fairPrice' | 'graham' | 'ceiling'>): Stock {
  // Cálculos baseados em Graham e Bazin
  const graham = Math.sqrt(22.5 * stock.lpa * stock.vpa);
  const fairPrice = stock.dividendYield > 0 ? (stock.dividendYield / 100) * stock.currentPrice * (100 / 6) : 0;
  const ceiling = stock.currentPrice * 1.5; // Simplificado
  const risk = ((stock.currentPrice - stock.avg5Years) / stock.avg5Years) * 100;
  const adjustedFairPrice = fairPrice * (1 - Math.max(0, risk) / 100);
  const marginOfSafety = ((graham - stock.currentPrice) / graham) * 100;
  const adjustedMargin = ((adjustedFairPrice - stock.currentPrice) / adjustedFairPrice) * 100;
  const distanceToCeiling = ((ceiling - stock.currentPrice) / stock.currentPrice) * 100;
  const potential = (marginOfSafety + adjustedMargin) / 2;

  // Classificação
  let classification: Stock['classification'];
  if (potential >= 30 && marginOfSafety >= 20 && adjustedMargin >= 20) {
    classification = 'APORTE FORTE';
  } else if (potential >= 15 && (marginOfSafety >= 10 || adjustedMargin >= 10)) {
    classification = 'APORTE';
  } else if (potential >= 5) {
    classification = 'APORTE PEQUENO';
  } else {
    classification = 'NÃO COMPRAR';
  }

  return {
    ...stock,
    graham,
    fairPrice,
    ceiling,
    risk,
    adjustedFairPrice,
    marginOfSafety,
    adjustedMargin,
    distanceToCeiling,
    potential,
    classification,
  };
}
