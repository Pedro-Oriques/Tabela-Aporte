import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksCacheJob } from './stocks-cache.job';
import { PlanilhaService } from './planilha.service';
import { StockValuation, StockSearchResult, StockRankingItem, StockPlanilha } from './stocks.types';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ParseTickerPipe } from './pipes/parse-ticker.pipe';

@Controller('stocks')
export class StocksController {
  constructor(
    private readonly stocksService: StocksService,
    private readonly cacheJob: StocksCacheJob,
    private readonly planilhaService: PlanilhaService,
  ) {}

  @Get('catalog')
  catalog(): StockSearchResult[] {
    return this.stocksService.catalog();
  }

  @Get('search')
  search(@Query('q') query: string): StockSearchResult[] {
    if (!query || query.length < 2) return [];
    return this.stocksService.search(query);
  }

  @Get('ranking/potential')
  rankingByPotential(@Query('limit') limit?: string): Promise<StockRankingItem[]> {
    return this.stocksService.getRankingByPotential(this.parseLimit(limit));
  }

  @Get('ranking/yield')
  rankingByYield(@Query('limit') limit?: string): Promise<StockRankingItem[]> {
    return this.stocksService.getRankingByYield(this.parseLimit(limit));
  }

  @Get('ranking/best')
  rankingBest(@Query('limit') limit?: string): Promise<StockRankingItem[]> {
    return this.stocksService.getRankingBest(this.parseLimit(limit));
  }

  @UseGuards(ApiKeyGuard)
  @Delete('cache')
  async clearCache(): Promise<{ deleted: number }> {
    const deleted = await this.stocksService.clearCache();
    return { deleted };
  }

  @UseGuards(ApiKeyGuard)
  @Post('cache/refresh')
  async refreshCache(): Promise<{ message: string }> {
    void this.cacheJob.runUpdateCycle();
    return { message: 'Ciclo de atualização iniciado em background' };
  }

  @Get('valuation/:ticker')
  getValuation(@Param('ticker', ParseTickerPipe) ticker: string): Promise<StockValuation> {
    return this.stocksService.getValuation(ticker);
  }

  @Get('planilha/:ticker')
  getPlanilha(@Param('ticker', ParseTickerPipe) ticker: string): Promise<StockPlanilha> {
    return this.planilhaService.getPlanilha(ticker);
  }

  private parseLimit(value?: string): number {
    const n = parseInt(value ?? '5', 10);
    if (isNaN(n) || n < 1) return 5;
    return Math.min(n, 20);
  }
}
