import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YahooService } from './yahoo.service';
import { BrapiService } from './brapi.service';
import { StockValuation, StockSearchResult, StockRankingItem } from './stocks.types';
import { STOCKS_CATALOG } from './stocks.data';

const RENDIMENTO_DESEJADO = 0.06;
const GRAHAM_MULTIPLIER = 22.5;
const PREMIO_DE_RISCO = 0.3;

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);
  private readonly noDataTickers = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly yahoo: YahooService,
    private readonly brapi: BrapiService,
  ) {}

  markNoData(ticker: string): void {
    this.noDataTickers.add(ticker);
  }

  catalog(): StockSearchResult[] {
    return STOCKS_CATALOG.filter((s) => !this.noDataTickers.has(s.ticker));
  }

  search(query: string): StockSearchResult[] {
    const q = query.toLowerCase();
    return STOCKS_CATALOG.filter(
      (s) =>
        !this.noDataTickers.has(s.ticker) &&
        (s.ticker.toLowerCase().includes(q) ||
          s.nome.toLowerCase().includes(q) ||
          s.setor.toLowerCase().includes(q)),
    ).slice(0, 10);
  }

  async getValuation(ticker: string): Promise<StockValuation> {
    const upper = ticker.toUpperCase();

    const cached = await this.prisma.stockCache.findUnique({
      where: { ticker: upper },
    });

    if (!cached) {
      throw new HttpException(
        'Dados ainda não disponíveis — aguarde o próximo ciclo de atualização (diário às 10h)',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Cache hit: ${upper}`);
    return JSON.parse(cached.data) as StockValuation;
  }

  async fetchAndCache(ticker: string): Promise<0 | 1> {
    try {
      const [brapiResults, yahooData] = await Promise.allSettled([
        this.brapi.fetchQuotes([ticker]),
        this.yahoo.getStockData(ticker),
      ]);

      const brapiPrice =
        brapiResults.status === 'fulfilled'
          ? (brapiResults.value[0]?.regularMarketPrice ?? 0)
          : 0;

      const yahoo =
        yahooData.status === 'fulfilled' ? yahooData.value : null;

      // Brapi tem prioridade para preço, Yahoo é fallback
      const valorAtual =
        brapiPrice > 0 ? brapiPrice : (yahoo?.regularMarketPrice ?? 0);

      if (!valorAtual) return 0;

      const hasGrahamData = (yahoo?.lpa ?? 0) !== 0 && (yahoo?.vpa ?? 0) !== 0;
      const hasBazinData = (yahoo?.mediaDividendos5Anos ?? 0) > 0;
      if (!hasGrahamData && !hasBazinData) return 0;

      // Yahoo Finance às vezes retorna valores totais (não por ação) para empresas brasileiras
      const rawLpa = yahoo?.lpa ?? 0;
      const rawVpa = yahoo?.vpa ?? 0;
      const rawMedia = yahoo?.mediaDividendos5Anos ?? 0;
      const rawUltimo = yahoo?.ultimoDividendo ?? 0;

      const vpa = rawVpa > 0 && rawVpa < valorAtual * 50 ? rawVpa : 0;
      const lpa = Math.abs(rawLpa) < valorAtual * 5 ? rawLpa : 0;
      const mediaDividendos5Anos = rawMedia < valorAtual ? rawMedia : 0;
      const ultimoDividendo = rawUltimo < valorAtual ? rawUltimo : 0;

      if (vpa !== rawVpa && rawVpa !== 0)
        this.logger.warn(`[${ticker}] VPA descartado: ${rawVpa} (price=${valorAtual})`);
      if (mediaDividendos5Anos !== rawMedia && rawMedia !== 0)
        this.logger.warn(`[${ticker}] mediaDividendos descartado: ${rawMedia} (price=${valorAtual})`);

      this.logger.debug(
        `[${ticker}] price=${valorAtual} (brapi=${brapiPrice} yahoo=${yahoo?.regularMarketPrice ?? 0}) lpa=${lpa} vpa=${vpa} media=${mediaDividendos5Anos} ultimo=${ultimoDividendo}`,
      );

      const hasUsableGraham = lpa !== 0 && vpa !== 0;
      const hasUsableBazin = mediaDividendos5Anos > 0;
      if (!hasUsableGraham && !hasUsableBazin) {
        this.logger.warn(`[${ticker}] Nenhum dado utilizável após sanity checks — removendo cache corrompido`);
        await this.prisma.stockCache.deleteMany({ where: { ticker } });
        return 0;
      }

      const valuation = this.calcularValuation({
        ticker,
        valorAtual,
        lpa,
        vpa,
        mediaDividendos5Anos,
        ultimoDividendo,
      });

      await this.prisma.stockCache.upsert({
        where: { ticker },
        update: { data: JSON.stringify(valuation), updatedAt: new Date() },
        create: { ticker, data: JSON.stringify(valuation) },
      });

      return 1;
    } catch (error: any) {
      this.logger.error(`Erro ao processar ${ticker}: ${error.message}`);
      return 0;
    }
  }

  async countCached(): Promise<number> {
    return this.prisma.stockCache.count();
  }

  async clearCache(): Promise<number> {
    const { count } = await this.prisma.stockCache.deleteMany();
    this.logger.log(`Cache limpo: ${count} registros removidos`);
    return count;
  }

  async getRankingByPotential(limit: number): Promise<StockRankingItem[]> {
    return this.queryRanking(
      (a, b) => b.potencialValorizacao - a.potencialValorizacao,
      limit,
      (v) => v.potencialValorizacao > 0 && v.vpa > 0 && v.lpa > 0,
    );
  }

  async getRankingByYield(limit: number): Promise<StockRankingItem[]> {
    return this.queryRanking(
      (a, b) => b.mediaDividendos5Anos - a.mediaDividendos5Anos,
      limit,
      (v) => v.vpa > 0 && v.mediaDividendos5Anos > 0,
    );
  }

  async getRankingBest(limit: number): Promise<StockRankingItem[]> {
    return this.queryRanking(
      (a, b) => b.potencialValorizacao - a.potencialValorizacao,
      limit,
      (v) => v.classificacaoAporte === 'Aporte Forte' && v.vpa > 0 && v.lpa > 0,
    );
  }

  private async queryRanking(
    compareFn: (a: StockValuation, b: StockValuation) => number,
    limit: number,
    filterFn?: (v: StockValuation) => boolean,
  ): Promise<StockRankingItem[]> {
    try {
      const rows = await this.prisma.stockCache.findMany();
      const catalogMap = new Map(STOCKS_CATALOG.map((s) => [s.ticker, s]));

      // Ignora tickers removidos do catálogo após o cache ser gerado
      let valuations = rows
        .filter((row) => catalogMap.has(row.ticker))
        .map((row) => JSON.parse(row.data) as StockValuation);

      if (filterFn) {
        valuations = valuations.filter(filterFn);
      }

      return valuations
        .sort(compareFn)
        .slice(0, limit)
        .map((v) => {
          const info = catalogMap.get(v.ticker);
          return {
            ticker: v.ticker,
            nome: info?.nome ?? v.ticker,
            setor: info?.setor ?? '',
            valorAtual: v.valorAtual,
            potencialValorizacao: v.potencialValorizacao,
            mediaDividendos5Anos: v.mediaDividendos5Anos,
            classificacaoAporte: v.classificacaoAporte,
          };
        });
    } catch {
      return [];
    }
  }

  private calcularValuation(params: {
    ticker: string;
    valorAtual: number;
    lpa: number;
    vpa: number;
    mediaDividendos5Anos: number;
    ultimoDividendo: number;
  }): StockValuation {
    const { ticker, valorAtual, lpa, vpa, mediaDividendos5Anos, ultimoDividendo } = params;

    const precoTeto =
      mediaDividendos5Anos > 0 ? mediaDividendos5Anos / RENDIMENTO_DESEJADO : 0;

    const precoJusto =
      lpa > 0 && vpa > 0 ? Math.sqrt(GRAHAM_MULTIPLIER * lpa * vpa) : 0;

    const precoJustoAjustado = precoJusto * (1 - PREMIO_DE_RISCO);

    const margemSeguranca =
      precoJusto > 0 ? (precoJusto - valorAtual) / precoJusto : 0;

    const margemSegurancaAjustada =
      precoJustoAjustado > 0
        ? (precoJustoAjustado - valorAtual) / precoJustoAjustado
        : 0;

    const distanciaPrecoTeto =
      precoTeto > 0 ? (precoTeto - valorAtual) / precoTeto : 0;

    const potencialValorizacao =
      valorAtual > 0 ? (precoJusto - valorAtual) / valorAtual : 0;

    const classificacaoAporte = this.classificar(
      valorAtual,
      precoJustoAjustado,
      precoJusto,
      precoTeto,
    );

    return {
      ticker: ticker.toUpperCase(),
      valorAtual: round(valorAtual),
      mediaDividendos5Anos: round(mediaDividendos5Anos),
      ultimoDividendo: round(ultimoDividendo),
      lpa: round(lpa),
      vpa: round(vpa),
      rendimentoDesejado: round(RENDIMENTO_DESEJADO * 100),
      precoTeto: round(precoTeto),
      graham: GRAHAM_MULTIPLIER,
      precoJusto: round(precoJusto),
      premioDeRisco: round(PREMIO_DE_RISCO * 100),
      precoJustoAjustado: round(precoJustoAjustado),
      margemSeguranca: round(margemSeguranca * 100),
      margemSegurancaAjustada: round(margemSegurancaAjustada * 100),
      distanciaPrecoTeto: round(distanciaPrecoTeto * 100),
      potencialValorizacao: round(potencialValorizacao * 100),
      classificacaoAporte,
    };
  }

  private classificar(
    valorAtual: number,
    precoJustoAjustado: number,
    precoJusto: number,
    precoTeto: number,
  ): string {
    if (valorAtual < precoJustoAjustado) return 'Aporte Forte';
    if (valorAtual < precoJusto) return 'Aporte';
    if (valorAtual < precoTeto) return 'Aporte Pequeno';
    return 'Não Comprar';
  }
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
