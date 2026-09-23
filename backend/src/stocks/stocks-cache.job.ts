import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StocksService } from './stocks.service';
import { PlanilhaService } from './planilha.service';
import { STOCKS_CATALOG } from './stocks.data';

@Injectable()
export class StocksCacheJob implements OnModuleInit {
  private readonly logger = new Logger(StocksCacheJob.name);

  constructor(
    private readonly stocksService: StocksService,
    private readonly planilhaService: PlanilhaService,
  ) {}

  async onModuleInit() {
    const count = await this.stocksService.countCached();
    if (count === 0) {
      this.logger.log('Banco vazio no boot — disparando ciclo inicial de atualização');
      void this.runUpdateCycle();
    }
  }

  @Cron('0 10 * * 1-5', { timeZone: 'America/Sao_Paulo' })
  async scheduledUpdate() {
    this.logger.log('Cron disparado — iniciando ciclo de atualização');
    await this.runUpdateCycle();
  }

  async runUpdateCycle() {
    const tickers = this.stocksService.catalog().map((s) => s.ticker);
    this.logger.log(`Ciclo iniciado: ${tickers.length} tickers`);

    let valuationOk = 0;
    let planilhaOk = 0;

    for (const ticker of tickers) {
      const ok = await this.stocksService.fetchAndCache(ticker);
      if (ok) {
        valuationOk++;
        const pOk = await this.planilhaService.fetchAndCachePlanilha(ticker);
        if (pOk) planilhaOk++;
      } else {
        this.stocksService.markNoData(ticker);
        this.logger.warn(`Sem dados para ${ticker} — ticker ignorado nos próximos ciclos e removido da busca`);
      }
    }

    this.logger.log(
      `Ciclo concluído: valuation ${valuationOk}/${tickers.length}, planilha ${planilhaOk}/${tickers.length}`,
    );
  }
}
