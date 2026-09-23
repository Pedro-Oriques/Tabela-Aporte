'use client';

import { StockValuation } from '@/lib/types';
import { CountUpNumber } from '@/components/CountUpNumber';

interface Props {
  stocks: StockValuation[];
}

const ITEMS = [
  { label: 'Aporte Forte',   key: 'Aporte Forte',   color: 'var(--color-green)' },
  { label: 'Aporte',         key: 'Aporte',         color: 'var(--color-blue)' },
  { label: 'Aporte Pequeno', key: 'Aporte Pequeno', color: 'var(--color-amber)' },
  { label: 'Não Comprar',    key: 'Não Comprar',    color: 'var(--color-red)' },
];

export default function SummaryWidget({ stocks }: Props) {
  const counts = stocks.reduce((acc, s) => {
    acc[s.classificacaoAporte] = (acc[s.classificacaoAporte] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {ITEMS.map(({ label, key, color }, i) => (
        <div
          key={key}
          className="card p-6"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <CountUpNumber
            value={counts[key] ?? 0}
            delay={i * 0.1}
            className="text-[32px] font-bold block"
            style={{ color }}
          />
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
