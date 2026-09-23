import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { YahooService } from './yahoo.service';
import { BrapiService } from './brapi.service';
import { BcbService } from './bcb.service';
import { PlanilhaService } from './planilha.service';
import { StocksCacheJob } from './stocks-cache.job';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Module({
  providers: [StocksService, YahooService, BrapiService, BcbService, PlanilhaService, StocksCacheJob, ApiKeyGuard],
  controllers: [StocksController],
})
export class StocksModule {}
