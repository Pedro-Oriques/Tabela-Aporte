import { StockValuation, StockSearchResult, StockRankingItem, StockPlanilha } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function fetchValuation(ticker: string): Promise<StockValuation | null> {
  try {
    const res = await fetch(`${API_URL}/stocks/valuation/${ticker}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCatalog(): Promise<StockSearchResult[]> {
  try {
    const res = await fetch(`${API_URL}/stocks/catalog`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const res = await fetch(`${API_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchPlanilha(ticker: string): Promise<StockPlanilha | null> {
  try {
    const res = await fetch(`${API_URL}/stocks/planilha/${ticker}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getRanking(
  type: 'potential' | 'yield' | 'best',
  limit = 5,
): Promise<StockRankingItem[]> {
  try {
    const res = await fetch(`${API_URL}/stocks/ranking/${type}?limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
