'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { StockValuation, StockSearchResult } from '@/lib/types';

interface Props {
  stock: StockValuation | null;
  catalogEntry: StockSearchResult | null;
  onClose: () => void;
  onRemove: (ticker: string) => void;
  showRemove?: boolean;
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '8px 0',
        borderBottom: '1px solid var(--color-border)',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          fontFamily: 'monospace',
          color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ClassBadge({ value }: { value: string }) {
  const CONFIG: Record<string, string> = {
    'Aporte Forte':   'var(--color-green)',
    'Aporte':         'var(--color-blue)',
    'Aporte Pequeno': 'var(--color-amber)',
    'Não Comprar':    'var(--color-red)',
  };
  const color = CONFIG[value] ?? 'var(--color-text-secondary)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 'var(--radius-btn)',
        fontSize: '0.7rem',
        fontWeight: 600,
        border: `1px solid ${color}`,
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </span>
  );
}

function spreadPositions(original: number[], minGap: number): number[] {
  if (original.length === 0) return original;
  const items = original.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;
    for (let i = 0; i < items.length - 1; i++) {
      const gap = items[i + 1].v - items[i].v;
      if (gap < minGap) {
        const push = (minGap - gap) / 2;
        items[i].v -= push;
        items[i + 1].v += push;
        changed = true;
      }
    }
    if (!changed) break;
  }
  const result = new Array(original.length);
  for (const item of items) result[item.i] = Math.max(0, Math.min(100, item.v));
  return result;
}

function PriceBar({ valorAtual, precoTeto, precoJusto }: { valorAtual: number; precoTeto: number; precoJusto: number }) {
  const maxPrice = Math.max(valorAtual, precoTeto, precoJusto) * 1.15 || 1;
  const pct = (val: number) => Math.min(100, (val / maxPrice) * 100);

  const markers = [
    { label: 'ATUAL',  value: valorAtual, color: 'var(--color-green)' },
    { label: 'TETO',   value: precoTeto,  color: 'var(--color-amber)' },
    { label: 'GRAHAM', value: precoJusto, color: 'var(--color-blue)'  },
  ];

  const fillColor =
    valorAtual <= precoJusto ? 'var(--color-green)' :
    valorAtual <= precoTeto  ? 'var(--color-amber)' :
                               'var(--color-red)';
  const currentPct = pct(valorAtual);
  const tickPcts = markers.map(m => pct(m.value));
  const labelPcts = spreadPositions(tickPcts, 16);

  return (
    <div style={{ padding: '8px 0 4px' }}>
      <div style={{ position: 'relative', height: '52px' }}>
        <div
          style={{
            position: 'absolute',
            left: '4px', right: '4px',
            top: '50%', transform: 'translateY(-50%)',
            height: '6px',
            background: 'var(--color-border)',
            borderRadius: '3px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0, width: `${currentPct}%`,
              height: '100%',
              background: fillColor,
              borderRadius: '3px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        {markers.map((m, i) => (
          <div
            key={`tick-${m.label}`}
            style={{
              position: 'absolute',
              left: `calc(${tickPcts[i]}% + 4px)`,
              top: '20%', bottom: '20%',
              transform: 'translateX(-50%)',
              width: '2px',
              background: m.color,
              borderRadius: '1px',
            }}
          />
        ))}

        {markers.map((m, i) => (
          <div
            key={`label-${m.label}`}
            style={{
              position: 'absolute',
              left: `calc(${labelPcts[i]}% + 4px)`,
              top: 0, bottom: 0,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: m.color, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {m.label}
            </span>
            <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: m.color, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {m.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Barra de margem de segurança com zonas coloridas: vermelho < 0 < âmbar < 30% < verde
function SafetyBar({ value }: { value: number }) {
  const MIN = -100, MAX = 100;
  const clamped = Math.max(MIN, Math.min(MAX, value));
  const toPos = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

  const markerPos = toPos(clamped);
  const color =
    value >= 30  ? 'var(--color-green)' :
    value >= 0   ? 'var(--color-blue)'  :
    value >= -20 ? 'var(--color-amber)' :
                   'var(--color-red)';

  const zeroPos   = toPos(0);
  const thirtyPos = toPos(30);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Margem de Segurança
        </span>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color }}>
          {value >= 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>

      <div style={{ position: 'relative', paddingTop: '18px', paddingBottom: '22px' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${markerPos}%`,
            transform: 'translateX(-50%)',
            fontSize: '0.62rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            color,
            whiteSpace: 'nowrap',
          }}
        >
          {value >= 0 ? '+' : ''}{value.toFixed(1)}%
        </div>

        <div style={{ position: 'relative', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${zeroPos}%`, background: 'color-mix(in srgb, var(--color-red) 22%, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${zeroPos}%`, width: `${thirtyPos - zeroPos}%`, background: 'color-mix(in srgb, var(--color-amber) 22%, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${thirtyPos}%`, right: 0, background: 'color-mix(in srgb, var(--color-green) 22%, transparent)' }} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: `${markerPos}%`,
            transform: 'translateX(-50%)',
            width: '2px', height: '16px',
            background: color,
            borderRadius: '1px',
          }}
        />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '18px' }}>
          {[
            { label: '-100%', pos: 0,         align: 'left'   as const },
            { label: '0%',    pos: zeroPos,   align: 'center' as const },
            { label: '+30%',  pos: thirtyPos, align: 'center' as const },
            { label: '+100%', pos: 100,       align: 'right'  as const },
          ].map(({ label, pos, align }) => (
            <span
              key={label}
              style={{
                position: 'absolute',
                left: align === 'right' ? undefined : `${pos}%`,
                right: align === 'right' ? 0 : undefined,
                transform: align === 'center' ? 'translateX(-50%)' : undefined,
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function fmtPct(v: number) {
  return `${v.toFixed(2)}%`;
}

export default function DetailDrawer({ stock, catalogEntry, onClose, onRemove, showRemove = true }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (stock) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [stock, onClose]);

  return (
    <AnimatePresence>
      {stock && (
        <>
          <motion.div
            key="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 150,
            }}
          />

          <motion.div
            key="detail-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '380px',
              maxWidth: '100vw',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--color-border)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.6rem', color: 'var(--color-accent)', lineHeight: 1 }}>
                    {stock.ticker}
                  </p>
                  {catalogEntry?.nome && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '5px' }}>
                      {catalogEntry.nome}
                    </p>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <ClassBadge value={stock.classificacaoAporte} />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Comparativo de Preços
                </p>
                <PriceBar valorAtual={stock.valorAtual} precoTeto={stock.precoTeto} precoJusto={stock.precoJusto} />
              </div>

              <div
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '16px 20px',
                  marginBottom: '20px',
                }}
              >
                <SafetyBar value={stock.margemSeguranca} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Dados de Valuation
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <div>
                    <DataRow label="Preço Atual"    value={fmt(stock.valorAtual)}            highlight />
                    <DataRow label="LPA"            value={stock.lpa.toFixed(2)} />
                    <DataRow label="VPA"            value={stock.vpa.toFixed(2)} />
                    <DataRow label="Últ. Dividendo" value={fmt(stock.ultimoDividendo)} />
                    <DataRow label="Média 5A"       value={fmt(stock.mediaDividendos5Anos)} />
                  </div>
                  <div>
                    <DataRow label="Preço Teto"      value={fmt(stock.precoTeto)} />
                    <DataRow label="Graham"          value={fmt(stock.precoJusto)} />
                    <DataRow label="P.J. Ajustado"   value={fmt(stock.precoJustoAjustado)} />
                    <DataRow label="Prêmio de Risco" value={fmtPct(stock.premioDeRisco * 100)} />
                    <DataRow label="Rend. Desejado"  value={fmtPct(stock.rendimentoDesejado * 100)} />
                  </div>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <DataRow label="Margem de Segurança"   value={fmtPct(stock.margemSeguranca)} />
                  <DataRow label="M. Seg. Ajustada"      value={fmtPct(stock.margemSegurancaAjustada)} />
                  <DataRow label="Potencial de Valoriz." value={fmtPct(stock.potencialValorizacao)} />
                </div>
              </div>
            </div>

            {showRemove && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <button
                  onClick={() => { onRemove(stock.ticker); onClose(); }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-btn)',
                    border: '1px solid color-mix(in srgb, var(--color-red) 50%, transparent)',
                    background: 'color-mix(in srgb, var(--color-red) 8%, transparent)',
                    color: 'var(--color-red)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-red) 16%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-red) 8%, transparent)';
                  }}
                >
                  <Trash2 size={14} />
                  Remover da Watchlist
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
