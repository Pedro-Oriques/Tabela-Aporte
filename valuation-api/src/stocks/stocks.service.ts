import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface StockValuation {
  ticker: string;
  valorAtual: number;
  mediaDividendos5Anos: number;
  ultimoDividendo: number;
  lpa: number;
  vpa: number;
  rendimentoDesejado: number;
  precoTeto: number;
  graham: number;
  precoJusto: number;
  premioDeRisco: number;
  precoJustoAjustado: number;
  margemSeguranca: number;
  margemSegurancaAjustada: number;
  distanciaPrecoTeto: number;
  potencialValorizacao: number;
  classificacaoAporte: string;
}

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  // Constantes da sua estratégia
  private readonly RENDIMENTO_DESEJADO = 0.06;
  private readonly GRAHAM = 22.5;
  private readonly PREMIO_DE_RISCO = 0.3;

  async getValuationData(ticker: string): Promise<StockValuation> {
    try {
      this.logger.log(`Calculando valuation para ${ticker}...`);
      const tickerB3 = `${ticker}.SA`;

      // 1. Buscando TUDO pelo Yahoo Finance (Muito mais confiável para fundamentos)
      const quote = await yahooFinance.quote(tickerB3);

      const valorAtual = quote.regularMarketPrice || 0;
      const lpa = quote.epsTrailingTwelveMonths || 0; // Lucro por Ação Real
      const vpa = quote.bookValue || 0; // Valor Patrimonial Real

      // 2. Buscando histórico de dividendos
      const dataHoje = new Date();
      const data5AnosAtras = new Date();
      data5AnosAtras.setFullYear(dataHoje.getFullYear() - 5);

      const historicalDividends = (await yahooFinance.historical(tickerB3, {
        period1: data5AnosAtras,
        period2: dataHoje,
        events: 'dividends',
      })) as any[];

      let totalDividendos = 0;
      let ultimoDividendo = 0;

      if (historicalDividends && historicalDividends.length > 0) {
        const lastDiv = historicalDividends[historicalDividends.length - 1];
        ultimoDividendo = lastDiv.dividends || lastDiv.amount || 0;

        totalDividendos = historicalDividends.reduce(
          (acc, curr) => acc + (curr.dividends || curr.amount || 0),
          0,
        );
      }
      const mediaDividendos5Anos = totalDividendos / 5;

      // =========================================================
      // 3. CÁLCULOS MATEMÁTICOS
      // =========================================================

      const precoTeto = mediaDividendos5Anos / this.RENDIMENTO_DESEJADO;

      // Graham com trava de prejuízo
      const precoJusto =
        lpa > 0 && vpa > 0 ? Math.sqrt(this.GRAHAM * lpa * vpa) : 0;

      const precoJustoAjustado = precoJusto - precoJusto * this.PREMIO_DE_RISCO;

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

      // Classificação de Aporte
      let classificacaoAporte = 'Não Comprar';
      if (valorAtual < precoJustoAjustado) {
        classificacaoAporte = 'Aporte Forte';
      } else if (valorAtual < precoJusto) {
        classificacaoAporte = 'Aporte';
      } else if (valorAtual < precoTeto) {
        classificacaoAporte = 'Aporte Pequeno';
      }

      return {
        ticker: ticker.toUpperCase(),
        valorAtual: Number(valorAtual.toFixed(2)),
        mediaDividendos5Anos: Number(mediaDividendos5Anos.toFixed(2)),
        ultimoDividendo: Number(ultimoDividendo.toFixed(2)),
        lpa: Number(lpa.toFixed(2)),
        vpa: Number(vpa.toFixed(2)),
        rendimentoDesejado: Number((this.RENDIMENTO_DESEJADO * 100).toFixed(2)),
        precoTeto: Number(precoTeto.toFixed(2)),
        graham: this.GRAHAM,
        precoJusto: Number(precoJusto.toFixed(2)),
        premioDeRisco: Number((this.PREMIO_DE_RISCO * 100).toFixed(2)),
        precoJustoAjustado: Number(precoJustoAjustado.toFixed(2)),
        margemSeguranca: Number((margemSeguranca * 100).toFixed(2)),
        margemSegurancaAjustada: Number(
          (margemSegurancaAjustada * 100).toFixed(2),
        ),
        distanciaPrecoTeto: Number((distanciaPrecoTeto * 100).toFixed(2)),
        potencialValorizacao: Number((potencialValorizacao * 100).toFixed(2)),
        classificacaoAporte,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao processar ${ticker}: ${error.message}`);
      throw new HttpException(
        'Falha ao buscar dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
