/**
 * Script de integração para testar as APIs externas (Yahoo e Brapi).
 * Executa fora do Jest para evitar interferências no ambiente de cookies/fetch.
 *
 * Uso: npx ts-node scripts/test-apis.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BRAPI_TOKEN = process.env.BRAPI_TOKEN ?? '';
const TICKERS = ['PETR4', 'VALE3', 'ITUB4'];
const BRAPI_BASE = 'https://brapi.dev/api';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// ─── helpers ───────────────────────────────────────────────────────────────

function ok(msg: string) {
  console.log(`  ✅ ${msg}`);
}

function warn(msg: string) {
  console.warn(`  ⚠️  ${msg}`);
}

function fail(msg: string) {
  console.error(`  ❌ ${msg}`);
}

function section(title: string) {
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(55));
}

// ─── Brapi ────────────────────────────────────────────────────────────────

async function testBrapi() {
  section('BRAPI — cotação de preço');

  for (const ticker of TICKERS) {
    try {
      const params: Record<string, string> = {};
      if (BRAPI_TOKEN) params.token = BRAPI_TOKEN;

      const res = await axios.get(`${BRAPI_BASE}/quote/${ticker}`, { params });
      const result = res.data?.results?.[0];

      if (!result) {
        warn(`${ticker}: resposta vazia`);
        continue;
      }

      if (result.regularMarketPrice > 0) {
        ok(`${ticker}: R$ ${result.regularMarketPrice}`);
      } else {
        warn(`${ticker}: preço retornado é 0`);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const body = JSON.stringify(e?.response?.data ?? e.message);
      fail(`${ticker}: HTTP ${status} — ${body}`);
    }
  }
}

// ─── Yahoo — quote (preço, lpa, vpa) ─────────────────────────────────────

async function testYahooQuote() {
  section('YAHOO — quote (preço, lpa, vpa)');

  for (const ticker of TICKERS) {
    try {
      const q = await yf.quote(`${ticker}.SA`, {}, { validateResult: false }) as any;

      const price = q?.regularMarketPrice ?? 0;
      const lpa = q?.epsTrailingTwelveMonths ?? 0;
      const vpa = q?.bookValue ?? 0;

      if (price > 0) {
        ok(`${ticker}: preço=R$${price}  lpa=${lpa}  vpa=${vpa}`);
      } else {
        warn(`${ticker}: preço retornado é 0`);
      }
    } catch (e: any) {
      fail(`${ticker}: ${e.message}`);
    }
  }
}

// ─── Yahoo — dividendos históricos ────────────────────────────────────────

async function testYahooDividends() {
  section('YAHOO — dividendos históricos (5 anos)');

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 5);

  for (const ticker of TICKERS) {
    try {
      const result = await yf.chart(
        `${ticker}.SA`,
        {
          period1: cutoff.toISOString().slice(0, 10),
          period2: new Date().toISOString().slice(0, 10),
          interval: '1mo',
          events: 'div',
        },
        { validateResult: false },
      ) as any;

      const dividends: Array<{ amount: number; date: Date }> =
        result?.events?.dividends ?? [];

      if (dividends.length === 0) {
        warn(`${ticker}: nenhum dividendo encontrado nos últimos 5 anos`);
        continue;
      }

      const total = dividends.reduce((acc, d) => acc + d.amount, 0);
      const media = total / 5;
      const ultimo = [...dividends].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      )[0].amount;

      ok(`${ticker}: media5a=R$${media.toFixed(4)}  ultimo=R$${ultimo.toFixed(4)}  (${dividends.length} pagamentos)`);
    } catch (e: any) {
      fail(`${ticker}: ${e.message}`);
    }
  }
}

// ─── Yahoo — quoteSummary (financialData) ─────────────────────────────────

async function testYahooSummary() {
  section('YAHOO — quoteSummary financialData');

  for (const ticker of TICKERS) {
    try {
      const result = await yf.quoteSummary(
        `${ticker}.SA`,
        { modules: ['financialData'] } as any,
        { validateResult: false },
      ) as any;

      const fd = result?.financialData;

      if (!fd) {
        warn(`${ticker}: financialData ausente`);
        continue;
      }

      const roe = fd.returnOnEquity != null ? `${(fd.returnOnEquity * 100).toFixed(1)}%` : 'null';
      const margin = fd.profitMargins != null ? `${(fd.profitMargins * 100).toFixed(1)}%` : 'null';
      const debt = fd.totalDebt ?? null;
      const cash = fd.totalCash ?? null;
      const ebitda = fd.ebitda ?? null;
      const dl = debt != null && cash != null && ebitda ? ((debt - cash) / ebitda).toFixed(2) : 'null';

      ok(`${ticker}: roe=${roe}  margem=${margin}  dívida/ebitda=${dl}`);
    } catch (e: any) {
      fail(`${ticker}: ${e.message}`);
    }
  }
}

// ─── main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 Testando APIs externas...\n');

  await testBrapi();
  await testYahooQuote();
  await testYahooDividends();
  await testYahooSummary();

  console.log('\n✔  Diagnóstico concluído.\n');
}

main().catch((e) => {
  console.error('Erro fatal:', e);
  process.exit(1);
});
