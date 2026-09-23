import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

const BCB_IPCA_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface IpcaCache {
  value: number;
  fetchedAt: number;
}

@Injectable()
export class BcbService {
  private readonly logger = new Logger(BcbService.name);
  private readonly ipcaCache = new Map<string, IpcaCache>();

  async getIpcaCumulativo(): Promise<number | null> {
    const cacheKey = this.currentMonthKey();
    const cached = this.ipcaCache.get(cacheKey);

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.value;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);

      const params = {
        formato: 'json',
        dataInicial: this.formatDate(startDate),
        dataFinal: this.formatDate(endDate),
      };

      const response = await axios.get<Array<{ data: string; valor: string }>>(BCB_IPCA_URL, {
        params,
        timeout: 10000,
      });

      const entries = response.data;
      if (!entries || entries.length === 0) {
        this.logger.warn('BCB retornou dados vazios para IPCA');
        return null;
      }

      const cumulative = entries.reduce((acc, entry) => {
        const rate = parseFloat(entry.valor.replace(',', '.'));
        if (isNaN(rate)) return acc;
        return acc * (1 + rate / 100);
      }, 1);

      const ipcaCumulativo = (cumulative - 1) * 100;

      this.ipcaCache.set(cacheKey, { value: ipcaCumulativo, fetchedAt: Date.now() });
      this.logger.log(`IPCA cumulativo 5 anos: ${ipcaCumulativo.toFixed(2)}%`);

      return ipcaCumulativo;
    } catch (error: any) {
      this.logger.warn(`Erro ao buscar IPCA do BCB: ${error.message}`);
      return null;
    }
  }

  async getAcaoVsInflacao(priceReturn5y: number | null): Promise<boolean | null> {
    if (priceReturn5y === null) return null;

    const ipcaCumulativo = await this.getIpcaCumulativo();
    if (ipcaCumulativo === null) return null;

    return priceReturn5y > ipcaCumulativo;
  }

  private formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private currentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
