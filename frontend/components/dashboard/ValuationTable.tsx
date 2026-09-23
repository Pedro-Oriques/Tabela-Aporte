'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { StockValuation } from '@/lib/types';
import ClassificacaoBadge from '@/components/ClassificacaoBadge';

type SortKey = keyof StockValuation | 'dividendYield';
type SortDirection = 'asc' | 'desc';

interface Props {
  stocks: StockValuation[];
  onRemove?: (ticker: string) => void;
  onRowClick?: (stock: StockValuation) => void;
}

type Col = { label: string; key: SortKey; align?: 'left' | 'right' };

const COLUMNS: Col[] = [
  { label: 'ATUAL (R$)',   key: 'valorAtual',           align: 'right' },
  { label: 'MÉD. 5A',     key: 'mediaDividendos5Anos', align: 'right' },
  { label: 'LPA',          key: 'lpa',                  align: 'right' },
  { label: 'VPA',          key: 'vpa',                  align: 'right' },
  { label: 'REND. (%)',    key: 'dividendYield',        align: 'right' },
  { label: 'TETO (R$)',   key: 'precoTeto',             align: 'right' },
  { label: 'GRAHAM (R$)', key: 'precoJusto',            align: 'right' },
  { label: 'M. SEG. (%)', key: 'margemSeguranca',      align: 'right' },
  { label: 'POTENCIAL',   key: 'potencialValorizacao',  align: 'right' },
];

function getDividendYield(s: StockValuation) {
  return s.valorAtual > 0 ? (s.mediaDividendos5Anos / s.valorAtual) * 100 : 0;
}

function getValue(s: StockValuation, key: SortKey): number | string {
  if (key === 'dividendYield') return getDividendYield(s);
  return s[key as keyof StockValuation] as number | string;
}

const thStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  background: 'var(--color-surface-2)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '10px 12px',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

export default function ValuationTable({ stocks, onRemove, onRowClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('classificacaoAporte');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const aVal = getValue(a, sortKey);
      const bVal = getValue(b, sortKey);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [stocks, sortKey, sortDir]);

  function arrow(key: SortKey) {
    if (sortKey !== key) return '';
    return (
      <span style={{ color: 'var(--color-accent)', marginLeft: 2 }}>
        {sortDir === 'asc' ? '▲' : '▼'}
      </span>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
        <p>Nenhum ativo carregado.</p>
        <Link href="/stocks" className="text-sm mt-2 inline-block" style={{ color: 'var(--color-accent)' }}>
          Adicionar ações à watchlist →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" style={{ margin: '-12px', padding: '12px' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left' }} onClick={() => handleSort('ticker')}>
              ATIVO{arrow('ticker')}
            </th>
            {COLUMNS.map(({ label, key }) => (
              <th key={key} style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort(key)}>
                {label}{arrow(key)}
              </th>
            ))}
            <th style={{ ...thStyle, textAlign: 'left' }} onClick={() => handleSort('classificacaoAporte')}>
              CLASSIFICAÇÃO{arrow('classificacaoAporte')}
            </th>
            {onRemove && (
              <th style={{ ...thStyle, textAlign: 'center' }}>AÇÕES</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((stock, index) => {
            const dy = getDividendYield(stock);
            const rowBg = index % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)';

            return (
              <motion.tr
                key={stock.ticker}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ x: 2 }}
                className="table-row-hover"
                style={{
                  background: rowBg,
                  cursor: onRowClick ? 'pointer' : 'default',
                  borderBottom: index < sorted.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => onRowClick?.(stock)}
              >
                <td className="p-3">
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stock.ticker}
                  </span>
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.valorAtual.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.mediaDividendos5Anos.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.lpa.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.vpa.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: dy >= 6 ? 'var(--color-green)' : 'var(--color-text-primary)' }}>
                  {dy.toFixed(1)}%
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.precoTeto.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stock.precoJusto.toFixed(2)}
                </td>
                <td className="p-3 text-right text-sm" style={{ color: stock.margemSeguranca >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {stock.margemSeguranca.toFixed(1)}%
                </td>
                <td className="p-3 text-right text-sm" style={{ color: stock.potencialValorizacao >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {stock.potencialValorizacao.toFixed(1)}%
                </td>
                <td className="p-3">
                  <ClassificacaoBadge classificacao={stock.classificacaoAporte} />
                </td>
                {onRemove && (
                  <td className="p-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(stock.ticker); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors"
                      style={{
                        background: 'color-mix(in srgb, var(--color-red) 15%, transparent)',
                        color: 'var(--color-red)',
                        border: '1px solid color-mix(in srgb, var(--color-red) 35%, transparent)',
                      }}
                      title="Remover"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
