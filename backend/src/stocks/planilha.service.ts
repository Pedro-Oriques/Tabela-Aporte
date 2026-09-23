import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YahooService } from './yahoo.service';
import { BcbService } from './bcb.service';
import { StockValuation, StockPlanilha } from './stocks.types';

@Injectable()
export class PlanilhaService {
  private readonly logger = new Logger(PlanilhaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yahoo: YahooService,
    private readonly bcb: BcbService,
  ) {}

  async getPlanilha(ticker: string): Promise<StockPlanilha> {
    const upper = ticker.toUpperCase();
    const cached = await this.prisma.planilhaCache.findUnique({ where: { ticker: upper } });

    if (!cached) {
      throw new HttpException(
        'Dados de planilha ainda não disponíveis — aguarde o próximo ciclo de atualização',
        HttpStatus.NOT_FOUND,
      );
    }

    return JSON.parse(cached.data) as StockPlanilha;
  }

  async fetchAndCachePlanilha(ticker: string): Promise<0 | 1> {
    try {
      const upper = ticker.toUpperCase();

      const stockCacheRow = await this.prisma.stockCache.findUnique({ where: { ticker: upper } });
      if (!stockCacheRow) return 0;

      const valuation = JSON.parse(stockCacheRow.data) as StockValuation;
      const summaryData = await this.yahoo.getQuoteSummaryData(upper);
      const acaoVsInflacao = await this.bcb.getAcaoVsInflacao(summaryData.priceReturn5y);

      const { valorAtual, mediaDividendos5Anos, lpa, vpa } = valuation;

      const dy = valorAtual > 0 && mediaDividendos5Anos > 0
        ? round((mediaDividendos5Anos / valorAtual) * 100)
        : null;

      const pl = lpa !== 0 ? round(valorAtual / lpa) : null;

      const pvp = vpa > 0 ? valorAtual / vpa : null;
      const pvpTimesPl = pvp !== null && pl !== null ? round(pvp * pl) : null;

      const planilha: StockPlanilha = {
        ticker: upper,
        dy,
        crescimentoLucro: summaryData.crescimentoLucro,
        pl,
        pvpTimesPl,
        margemLiquida: summaryData.margemLiquida,
        roe: summaryData.roe,
        dividaLiquidaEbitda: summaryData.dividaLiquidaEbitda,
        acaoVsInflacao,
      };

      await this.prisma.planilhaCache.upsert({
        where: { ticker: upper },
        update: { data: JSON.stringify(planilha), updatedAt: new Date() },
        create: { ticker: upper, data: JSON.stringify(planilha) },
      });

      return 1;
    } catch (error: any) {
      this.logger.error(`Erro ao processar planilha de ${ticker}: ${error.message}`);
      return 0;
    }
  }
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
