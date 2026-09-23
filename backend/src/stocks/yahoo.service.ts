import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

const ANOS_HISTORICO = 5;

export interface YahooStockData {
  regularMarketPrice: number;
  lpa: number;
  vpa: number;
  mediaDividendos5Anos: number;
  ultimoDividendo: number;
}

export interface YahooSummaryData {
  margemLiquida: number | null;
  roe: number | null;
  dividaLiquidaEbitda: number | null;
  crescimentoLucro: number | null;
  priceReturn5y: number | null;
}

@Injectable()
export class YahooService {
  private readonly logger = new Logger(YahooService.name);
  private readonly yf = new YahooFinance();

  async getStockData(ticker: string): Promise<YahooStockData> {
    const symbol = `${ticker}.SA`;

    const [quote, dividendStats] = await Promise.allSettled([
      this.yf.quote(symbol, {}, { validateResult: false }),
      this.fetchDividendStats(symbol),
    ]);

    const q = quote.status === 'fulfilled' ? quote.value : null;
    const d = dividendStats.status === 'fulfilled'
      ? dividendStats.value
      : { mediaDividendos5Anos: 0, ultimoDividendo: 0 };

    if (!q) {
      this.logger.warn(`Yahoo sem dados de cotação para ${symbol}`);
    }

    return {
      regularMarketPrice: q?.regularMarketPrice ?? 0,
      lpa: (q as any)?.epsTrailingTwelveMonths ?? 0,
      vpa: (q as any)?.bookValue ?? 0,
      mediaDividendos5Anos: d.mediaDividendos5Anos,
      ultimoDividendo: d.ultimoDividendo,
    };
  }

  async getQuoteSummaryData(ticker: string): Promise<YahooSummaryData> {
    const symbol = `${ticker}.SA`;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - ANOS_HISTORICO);

    const [summaryResult, financialsResult, priceResult] = await Promise.allSettled([
      this.yf.quoteSummary(
        symbol,
        { modules: ['financialData'] as any },
        { validateResult: false },
      ),
      this.yf.fundamentalsTimeSeries(
        symbol,
        { period1: cutoff.toISOString().slice(0, 10), type: 'annual', module: 'financials' },
        { validateResult: false },
      ),
      this.fetchPriceReturn5y(symbol),
    ]);

    const summary = summaryResult.status === 'fulfilled' ? (summaryResult.value as any) : null;
    const financials = financialsResult.status === 'fulfilled' ? financialsResult.value : [];
    const priceReturn5y = priceResult.status === 'fulfilled' ? priceResult.value : null;

    if (!summary) {
      this.logger.warn(`Yahoo sem quoteSummary para ${symbol}`);
      return { margemLiquida: null, roe: null, dividaLiquidaEbitda: null, crescimentoLucro: null, priceReturn5y };
    }

    const fd = summary.financialData ?? null;

    const margemLiquida = this.extractPercent(fd?.profitMargins);
    const roe = this.extractPercent(fd?.returnOnEquity);
    const dividaLiquidaEbitda = this.computeDividaLiquidaEbitda(fd);
    const crescimentoLucro = this.computeCAGR(financials as any[]);

    return { margemLiquida, roe, dividaLiquidaEbitda, crescimentoLucro, priceReturn5y };
  }

  async fetchPriceReturn5y(symbol: string): Promise<number | null> {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - ANOS_HISTORICO);

      const result = await this.yf.chart(
        symbol,
        {
          period1: cutoff.toISOString().slice(0, 10),
          period2: new Date().toISOString().slice(0, 10),
          interval: '1mo',
        },
        { validateResult: false },
      ) as any;

      const quotes: Array<{ date: Date; close: number | null }> = result?.quotes ?? [];
      if (quotes.length < 2) return null;

      const sorted = [...quotes].sort((a, b) => a.date.getTime() - b.date.getTime());
      const firstClose = sorted[0]?.close ?? 0;
      const lastClose = sorted[sorted.length - 1]?.close ?? 0;

      if (!firstClose || !lastClose) return null;

      return ((lastClose - firstClose) / firstClose) * 100;
    } catch (error: any) {
      this.logger.warn(`Yahoo sem histórico de preços para ${symbol}: ${error.message}`);
      return null;
    }
  }

  private extractPercent(value: any): number | null {
    if (value === undefined || value === null) return null;
    const raw = typeof value === 'object' ? value.raw : value;
    if (typeof raw !== 'number' || !isFinite(raw)) return null;
    return round(raw * 100);
  }

  private computeDividaLiquidaEbitda(fd: any): number | null {
    if (!fd) return null;
    const totalDebt = typeof fd.totalDebt === 'object' ? fd.totalDebt?.raw : fd.totalDebt;
    const totalCash = typeof fd.totalCash === 'object' ? fd.totalCash?.raw : fd.totalCash;
    const ebitda = typeof fd.ebitda === 'object' ? fd.ebitda?.raw : fd.ebitda;

    if (typeof ebitda !== 'number' || ebitda === 0 || !isFinite(ebitda)) return null;
    const debt = typeof totalDebt === 'number' ? totalDebt : 0;
    const cash = typeof totalCash === 'number' ? totalCash : 0;

    return round((debt - cash) / ebitda);
  }

  private computeCAGR(entries: any[]): number | null {
    if (!entries || entries.length === 0) return null;

    const valid = entries
      .filter((e) => typeof e.netIncome === 'number' && isFinite(e.netIncome))
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

    if (valid.length < 2) return null;

    const earliest = valid[0];
    const latest = valid[valid.length - 1];

    if (earliest.netIncome <= 0 || latest.netIncome < 0) return null;
    if (earliest.netIncome === 0) return null;

    const years =
      ((latest.date as Date).getTime() - (earliest.date as Date).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000);

    if (years < 0.5) return null;

    const cagr = (Math.pow(latest.netIncome / earliest.netIncome, 1 / years) - 1) * 100;
    return round(cagr);
  }

  private async fetchDividendStats(symbol: string): Promise<{
    mediaDividendos5Anos: number;
    ultimoDividendo: number;
  }> {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - ANOS_HISTORICO);

      const result = await this.yf.chart(
        symbol,
        {
          period1: cutoff.toISOString().slice(0, 10),
          period2: new Date().toISOString().slice(0, 10),
          interval: '1mo',
          events: 'div',
        },
        { validateResult: false },
      ) as any;

      const dividends: Array<{ amount: number; date: Date }> = result?.events?.dividends ?? [];
      if (!dividends.length) return { mediaDividendos5Anos: 0, ultimoDividendo: 0 };

      const total = dividends.reduce((acc, d) => acc + d.amount, 0);
      const sorted = [...dividends].sort((a, b) => b.date.getTime() - a.date.getTime());

      return {
        mediaDividendos5Anos: total / ANOS_HISTORICO,
        ultimoDividendo: sorted[0].amount,
      };
    } catch (error: any) {
      this.logger.warn(`Yahoo sem dividendos para ${symbol}: ${error.message}`);
      return { mediaDividendos5Anos: 0, ultimoDividendo: 0 };
    }
  }
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
