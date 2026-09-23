import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const BRAPI_BASE = 'https://brapi.dev/api';

export interface BrapiQuoteResult {
  symbol: string;
  regularMarketPrice: number;
}

@Injectable()
export class BrapiService {
  private readonly logger = new Logger(BrapiService.name);
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    this.token = config.get<string>('BRAPI_TOKEN') ?? '';
  }

  async fetchQuotes(tickers: string[]): Promise<BrapiQuoteResult[]> {
    const symbols = tickers.join(',');
    const params: Record<string, string> = {};
    if (this.token) params.token = this.token;

    this.logger.debug(`Buscando cotações: ${symbols}`);
    try {
      const res = await axios.get(`${BRAPI_BASE}/quote/${symbols}`, { params });
      return (res.data?.results ?? []) as BrapiQuoteResult[];
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        this.logger.debug(`Brapi: ticker não encontrado — ${symbols}`);
        return [];
      }
      const body = JSON.stringify(error?.response?.data);
      this.logger.error(`Brapi HTTP ${status} — ${body}`);
      return [];
    }
  }

}
