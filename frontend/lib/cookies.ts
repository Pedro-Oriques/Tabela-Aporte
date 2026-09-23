import Cookies from 'js-cookie';

const WATCHLIST_KEY = 'watchlist';
const COOKIE_EXPIRES_DAYS = 30;

export function getWatchlist(): string[] {
  const saved = Cookies.get(WATCHLIST_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveWatchlist(tickers: string[]): void {
  Cookies.set(WATCHLIST_KEY, JSON.stringify(tickers), {
    expires: COOKIE_EXPIRES_DAYS,
  });
}

export function addToWatchlist(ticker: string): string[] {
  const current = getWatchlist();
  if (current.includes(ticker)) return current;
  const updated = [ticker, ...current];
  saveWatchlist(updated);
  return updated;
}

export function removeFromWatchlist(ticker: string): string[] {
  const updated = getWatchlist().filter((t) => t !== ticker);
  saveWatchlist(updated);
  return updated;
}
