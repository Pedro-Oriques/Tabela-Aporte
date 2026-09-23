import { Test, TestingModule } from '@nestjs/testing';
import { YahooService } from './yahoo.service';
import YahooFinance from 'yahoo-finance2';

jest.mock('yahoo-finance2');
const MockedYahooFinance = YahooFinance as jest.MockedClass<typeof YahooFinance>;

// Helper para montar instância mockada
function makeQuote(overrides: Record<string, any> = {}) {
  return {
    regularMarketPrice: 38.5,
    epsTrailingTwelveMonths: 4.2,
    bookValue: 28.0,
    ...overrides,
  };
}

describe('YahooService', () => {
  let service: YahooService;
  let yfInstance: jest.Mocked<InstanceType<typeof YahooFinance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YahooService],
    }).compile();

    service = module.get<YahooService>(YahooService);

    // Pega a instância mockada criada pelo construtor
    yfInstance = MockedYahooFinance.mock.instances[0] as jest.Mocked<
      InstanceType<typeof YahooFinance>
    >;

    jest.clearAllMocks();
  });

  describe('getStockData', () => {
    it('retorna dados completos quando Yahoo responde normalmente', async () => {
      yfInstance.quote.mockResolvedValueOnce(makeQuote() as any);
      yfInstance.chart.mockResolvedValueOnce({
        quotes: [],
        events: {
          dividends: [
            { amount: 1.2, date: new Date('2023-01-01') },
            { amount: 0.8, date: new Date('2022-06-01') },
            { amount: 1.0, date: new Date('2021-01-01') },
          ],
        },
      } as any);

      const result = await service.getStockData('PETR4');

      expect(result.regularMarketPrice).toBe(38.5);
      expect(result.lpa).toBe(4.2);
      expect(result.vpa).toBe(28.0);
      expect(result.mediaDividendos5Anos).toBeGreaterThan(0);
      expect(result.ultimoDividendo).toBeGreaterThan(0);
    });

    it('retorna zeros quando quote falha', async () => {
      yfInstance.quote.mockRejectedValueOnce(new Error('Yahoo indisponível'));
      yfInstance.chart.mockResolvedValueOnce({ quotes: [], events: {} } as any);

      const result = await service.getStockData('PETR4');

      expect(result.regularMarketPrice).toBe(0);
      expect(result.lpa).toBe(0);
      expect(result.vpa).toBe(0);
    });

    it('retorna dividendos zero quando chart falha', async () => {
      yfInstance.quote.mockResolvedValueOnce(makeQuote() as any);
      yfInstance.chart.mockRejectedValueOnce(new Error('Sem histórico'));

      const result = await service.getStockData('PETR4');

      expect(result.mediaDividendos5Anos).toBe(0);
      expect(result.ultimoDividendo).toBe(0);
      expect(result.regularMarketPrice).toBe(38.5);
    });

    it('retorna zeros quando não há dividendos históricos', async () => {
      yfInstance.quote.mockResolvedValueOnce(makeQuote() as any);
      yfInstance.chart.mockResolvedValueOnce({
        quotes: [],
        events: { dividends: [] },
      } as any);

      const result = await service.getStockData('PETR4');

      expect(result.mediaDividendos5Anos).toBe(0);
      expect(result.ultimoDividendo).toBe(0);
    });

    it('calcula média de dividendos corretamente para 5 anos', async () => {
      const dividends = [
        { amount: 2.0, date: new Date('2024-01-01') },
        { amount: 1.5, date: new Date('2023-01-01') },
        { amount: 1.0, date: new Date('2022-01-01') },
        { amount: 0.5, date: new Date('2021-01-01') },
        { amount: 0.5, date: new Date('2020-01-01') },
      ];

      yfInstance.quote.mockResolvedValueOnce(makeQuote() as any);
      yfInstance.chart.mockResolvedValueOnce({
        quotes: [],
        events: { dividends },
      } as any);

      const result = await service.getStockData('PETR4');

      // total = 5.5, media = 5.5 / 5 = 1.1
      expect(result.mediaDividendos5Anos).toBe(1.1);
      // ultimo é o mais recente
      expect(result.ultimoDividendo).toBe(2.0);
    });
  });

  describe('getQuoteSummaryData', () => {
    const mockSummary = {
      financialData: {
        profitMargins: { raw: 0.15 },
        returnOnEquity: { raw: 0.18 },
        totalDebt: { raw: 100_000_000 },
        totalCash: { raw: 20_000_000 },
        ebitda: { raw: 40_000_000 },
      },
    };

    it('retorna dados financeiros completos', async () => {
      yfInstance.quoteSummary.mockResolvedValueOnce(mockSummary as any);
      yfInstance.fundamentalsTimeSeries.mockResolvedValueOnce([] as any);
      yfInstance.chart.mockResolvedValueOnce({ quotes: [] } as any);

      const result = await service.getQuoteSummaryData('PETR4');

      expect(result.margemLiquida).toBe(15);
      expect(result.roe).toBe(18);
      expect(result.dividaLiquidaEbitda).toBe(2); // (100M - 20M) / 40M
    });

    it('retorna nulls quando quoteSummary falha', async () => {
      yfInstance.quoteSummary.mockRejectedValueOnce(new Error('Falha'));
      yfInstance.fundamentalsTimeSeries.mockResolvedValueOnce([] as any);
      yfInstance.chart.mockResolvedValueOnce({ quotes: [] } as any);

      const result = await service.getQuoteSummaryData('PETR4');

      expect(result.margemLiquida).toBeNull();
      expect(result.roe).toBeNull();
      expect(result.dividaLiquidaEbitda).toBeNull();
    });

    it('calcula CAGR de lucro com séries históricas', async () => {
      const entries = [
        { date: new Date('2020-12-31'), netIncome: 10_000_000 },
        { date: new Date('2021-12-31'), netIncome: 12_000_000 },
        { date: new Date('2022-12-31'), netIncome: 14_000_000 },
        { date: new Date('2023-12-31'), netIncome: 16_000_000 },
      ];

      yfInstance.quoteSummary.mockResolvedValueOnce(mockSummary as any);
      yfInstance.fundamentalsTimeSeries.mockResolvedValueOnce(entries as any);
      yfInstance.chart.mockResolvedValueOnce({ quotes: [] } as any);

      const result = await service.getQuoteSummaryData('PETR4');

      expect(result.crescimentoLucro).not.toBeNull();
      expect(result.crescimentoLucro).toBeGreaterThan(0);
    });

    it('retorna crescimentoLucro null quando há menos de 2 entradas válidas', async () => {
      yfInstance.quoteSummary.mockResolvedValueOnce(mockSummary as any);
      yfInstance.fundamentalsTimeSeries.mockResolvedValueOnce([
        { date: new Date('2023-12-31'), netIncome: 10_000_000 },
      ] as any);
      yfInstance.chart.mockResolvedValueOnce({ quotes: [] } as any);

      const result = await service.getQuoteSummaryData('PETR4');

      expect(result.crescimentoLucro).toBeNull();
    });
  });

  describe('fetchPriceReturn5y', () => {
    it('calcula retorno percentual corretamente', async () => {
      yfInstance.chart.mockResolvedValueOnce({
        quotes: [
          { date: new Date('2020-01-01'), close: 20 },
          { date: new Date('2021-01-01'), close: 25 },
          { date: new Date('2025-01-01'), close: 40 },
        ],
      } as any);

      const result = await service.fetchPriceReturn5y('PETR4.SA');

      // (40 - 20) / 20 * 100 = 100%
      expect(result).toBe(100);
    });

    it('retorna null com menos de 2 pontos de dados', async () => {
      yfInstance.chart.mockResolvedValueOnce({
        quotes: [{ date: new Date('2024-01-01'), close: 30 }],
      } as any);

      const result = await service.fetchPriceReturn5y('PETR4.SA');

      expect(result).toBeNull();
    });

    it('retorna null quando chart falha', async () => {
      yfInstance.chart.mockRejectedValueOnce(new Error('Timeout'));

      const result = await service.fetchPriceReturn5y('PETR4.SA');

      expect(result).toBeNull();
    });
  });
});
