'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { StockSearchResult } from '@/lib/types';
import { searchStocks } from '@/lib/api';

interface Props {
  onSelect: (stock: StockSearchResult) => void;
  placeholder?: string;
}

export default function SearchBar({ onSelect, placeholder = 'Adicionar ativo...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const data = await searchStocks(query);
      setResults(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, results.length - 1));
    else if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0));
    else if (e.key === 'Enter' && activeIndex >= 0) handleSelect(results[activeIndex]);
    else if (e.key === 'Escape') setOpen(false);
  }

  function handleSelect(stock: StockSearchResult) {
    onSelect(stock);
    setQuery('');
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-btn)',
        }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm w-full uppercase"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {open && (
        <ul
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          {results.map((stock, i) => (
            <li
              key={stock.ticker}
              onClick={() => handleSelect(stock)}
              className="px-4 py-3 cursor-pointer flex justify-between items-center gap-2 text-sm transition-colors"
              style={{
                background: i === activeIndex ? 'var(--color-surface-2)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {stock.ticker}
              </span>
              <span className="truncate flex-1 mx-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {stock.nome}
              </span>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                {stock.setor}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
