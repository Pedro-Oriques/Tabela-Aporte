'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Check } from 'lucide-react';
import { StockSearchResult, StockValuation } from '@/lib/types';
import { getCatalog, fetchValuation } from '@/lib/api';
import { getWatchlist, saveWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/cookies';
import DetailDrawer from '@/components/dashboard/DetailDrawer';

const ALL_SECTORS = 'Todos';

export default function StocksPage() {
  const [catalog, setCatalog] = useState<StockSearchResult[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [activeSector, setActiveSector] = useState(ALL_SECTORS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockValuation | null>(null);

  const catalogMap = Object.fromEntries(catalog.map((s) => [s.ticker, s]));

  async function handleDetail(ticker: string) {
    const data = await fetchValuation(ticker);
    if (data) setSelected(data);
  }

  useEffect(() => {
    document.documentElement.classList.add('warm-obsidian');
    return () => document.documentElement.classList.remove('warm-obsidian');
  }, []);

  useEffect(() => {
    getCatalog().then((data) => {
      setCatalog(data);
      setLoading(false);

      // Remove tickers inválidos do cookie quando removidos do catálogo
      const validTickers = new Set(data.map((s) => s.ticker));
      const saved = getWatchlist();
      const cleaned = saved.filter((t) => validTickers.has(t));
      if (cleaned.length !== saved.length) saveWatchlist(cleaned);
      setWatchlist(cleaned);
    });
  }, []);

  const sectors = [ALL_SECTORS, ...Array.from(new Set(catalog.map((s) => s.setor))).sort()];

  const filtered = catalog.filter((stock) => {
    const matchesQuery =
      stock.ticker.toLowerCase().includes(query.toLowerCase()) ||
      stock.nome.toLowerCase().includes(query.toLowerCase());
    const matchesSector = activeSector === ALL_SECTORS || stock.setor === activeSector;
    return matchesQuery && matchesSector;
  });

  function toggle(ticker: string) {
    if (watchlist.includes(ticker)) {
      setWatchlist(removeFromWatchlist(ticker));
    } else {
      setWatchlist(addToWatchlist(ticker));
    }
  }

  return (
    <div className="min-h-screen py-12 px-8" style={{ background: 'var(--color-bg)' }}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Selecionar Ações
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {watchlist.length} ativo(s) selecionado(s) para a watchlist
          </p>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-btn)',
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="BUSCAR POR TICKER OU NOME..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-sm uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {sectors.map((sector, index) => {
              const active = activeSector === sector;
              return (
                <motion.button
                  key={sector}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + index * 0.02 }}
                  whileHover={{ scale: 1.05, filter: active ? "brightness(1.1)" : "brightness(1.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSector(sector)}
                  className="px-4 py-2 text-sm font-medium flex-shrink-0"
                  style={{
                    borderRadius: 'var(--radius-btn)',
                    background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: active ? '#ffffff' : 'var(--color-text-secondary)',
                    border: '1px solid transparent',
                  }}
                >
                  {sector}
                </motion.button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((stock, index) => {
              const isSelected = watchlist.includes(stock.ticker);
              return (
                <motion.div
                  key={stock.ticker}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + index * 0.02 }}
                  whileHover={{ y: -2 }}
                  className="card p-5"
                  style={{
                    cursor: 'pointer',
                    ...(isSelected ? {
                      borderColor: 'var(--color-accent)',
                      borderTop: '2px solid var(--color-accent)',
                      background: 'var(--color-surface-2)',
                    } : {}),
                  }}
                  onClick={() => handleDetail(stock.ticker)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                        {stock.ticker}
                      </h3>
                      <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {stock.nome}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {stock.setor}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); toggle(stock.ticker); }}
                      className="flex-shrink-0 px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                      style={isSelected ? {
                        background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                        color: 'var(--color-accent)',
                        border: '1px solid var(--color-accent)',
                        borderRadius: 'var(--radius-btn)',
                      } : {
                        background: 'var(--color-accent)',
                        color: '#fff',
                        borderRadius: 'var(--radius-btn)',
                      }}
                    >
                      {isSelected ? (
                        <><Check className="w-4 h-4" /> Remover</>
                      ) : (
                        <><Plus className="w-4 h-4" /> Adicionar</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-12 text-center col-span-2"
              >
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Nenhuma ação encontrada.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <DetailDrawer
        stock={selected}
        catalogEntry={selected ? (catalogMap[selected.ticker] ?? null) : null}
        onClose={() => setSelected(null)}
        onRemove={(ticker) => {
          setWatchlist(removeFromWatchlist(ticker));
          setSelected(null);
        }}
        showRemove={false}
      />
    </div>
  );
}
