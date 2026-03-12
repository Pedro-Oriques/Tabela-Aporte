import { Controller, Get, Param } from '@nestjs/common';
import { StocksService, StockValuation } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('valuation/:ticker')
  async getValuation(@Param('ticker') ticker: string): Promise<StockValuation> {
    return this.stocksService.getValuationData(ticker);
  }
}
