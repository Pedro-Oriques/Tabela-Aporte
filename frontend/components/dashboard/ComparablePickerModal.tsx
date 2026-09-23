'use client';

import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { StockSearchResult } from '@/lib/types';

interface Props {
  sector: string;
  position: number;
  alreadySelected: string[];
  watchlistTickers: string[];
  catalogMap: Record<string, StockSearchResult>;
  onSelect: (ticker: string, position: number) => void;
  onClose: () => void;
}

export default function ComparablePickerModal({
  sector,
  position,
  alreadySelected,
  watchlistTickers,
  catalogMap,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');

  const candidates = useMemo(() => {
    const excluded = new Set([...watchlistTickers, ...alreadySelected]);
    return Object.values(catalogMap)
      .filter((s) => s.setor === sector && !excluded.has(s.ticker))
      .sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [sector, watchlistTickers, alreadySelected, catalogMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.nome.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 12,
          width: 420,
          maxHeight: 520,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
            Substituir comparável — {sector}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'var(--color-text-secondary)',
              lineHeight: 1,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-surface-2)',
              borderRadius: 6,
              padding: '7px 12px',
              border: '1px solid var(--color-border)',
            }}
          >
            <Search size={13} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ticker ou empresa..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <p
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: 13,
              }}
            >
              Nenhum ativo encontrado.
            </p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.ticker}
                onClick={() => onSelect(s.ticker, position)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--color-surface-2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: 13 }}>
                  {s.ticker}
                </span>
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 12,
                    maxWidth: 220,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.nome}
                </span>
              </button>
            ))
          )}
        </div>

        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
