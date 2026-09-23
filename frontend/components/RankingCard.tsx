'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRanking } from '@/lib/api';
import { StockRankingItem } from '@/lib/types';

type RankingType = 'potential' | 'yield' | 'combined';

interface Props {
  type: RankingType;
  title: string;
  delay?: number;
  onItemClick?: (ticker: string, nome: string) => void;
}

function dy(item: StockRankingItem): number {
  return item.valorAtual > 0 ? (item.mediaDividendos5Anos / item.valorAtual) * 100 : 0;
}

function formatValue(item: StockRankingItem, type: RankingType): React.ReactNode {
  if (type === 'potential') {
    const v = item.potencialValorizacao;
    return (
      <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>
        {v >= 0 ? '+' : ''}{v.toFixed(1)}%
      </span>
    );
  }
  if (type === 'yield') {
    return (
      <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>
        {dy(item).toFixed(1)}%
      </span>
    );
  }
  const upside = item.potencialValorizacao;
  const dyVal = dy(item);
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span style={{ color: 'var(--color-green)', fontWeight: 600, fontSize: 12 }}>
        {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
      </span>
      <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
        DY {dyVal.toFixed(1)}%
      </span>
    </div>
  );
}

export default function RankingCard({ type, title, delay = 0, onItemClick }: Props) {
  const [items, setItems] = useState<StockRankingItem[] | null>(null);

  useEffect(() => {
    if (type === 'combined') {
      // Combina potencial de valorização e dividend yield, normaliza cada métrica e pondera 50/50
      Promise.all([getRanking('potential', 50), getRanking('yield', 50)]).then(
        ([byPotential, byYield]) => {
          const map = new Map<string, StockRankingItem>();
          [...byPotential, ...byYield].forEach((it) => {
            if (!map.has(it.ticker)) map.set(it.ticker, it);
          });
          const pool = Array.from(map.values()).filter((it) => it.potencialValorizacao > 0);

          const upsides = pool.map((it) => it.potencialValorizacao);
          const dys = pool.map((it) => dy(it));
          const minU = Math.min(...upsides), maxU = Math.max(...upsides);
          const minD = Math.min(...dys), maxD = Math.max(...dys);

          const norm = (v: number, min: number, max: number) =>
            max === min ? 0 : (v - min) / (max - min);

          const scored = pool
            .map((it) => ({
              item: it,
              score: 0.5 * norm(it.potencialValorizacao, minU, maxU) + 0.5 * norm(dy(it), minD, maxD),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((s) => s.item);

          setItems(scored);
        },
      );
    } else {
      getRanking(type, 5).then(setItems);
    }
  }, [type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="card flex flex-col gap-4"
    >
      <h3 className="text-base font-semibold px-4 pt-4" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>

      {items === null && (
        <div className="flex flex-col px-4 pb-4 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-shimmer h-9" />
          ))}
        </div>
      )}

      {items !== null && items.length === 0 && (
        <p className="text-sm py-6 px-4 pb-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Dados indisponíveis
        </p>
      )}

      {items !== null && items.length > 0 && (
        <ol className="flex flex-col">
          {items.map((item, i, arr) => (
            <motion.li
              key={item.ticker}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + i * 0.06 }}
              className="table-row-hover flex items-center justify-between gap-2 py-2 px-4"
              style={{
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: onItemClick ? 'pointer' : 'default',
                background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)',
              }}
              onClick={() => onItemClick?.(item.ticker, item.nome)}
              whileHover={onItemClick ? { x: 2 } : {}}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-xs font-medium w-4 text-right flex-shrink-0"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {item.ticker}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.nome}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-sm">
                {formatValue(item, type)}
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
