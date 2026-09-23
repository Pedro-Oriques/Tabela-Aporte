'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { StockPlanilha, StockSearchResult } from '@/lib/types';
import { fetchPlanilha } from '@/lib/api';
import ComparablePickerModal from './ComparablePickerModal';

interface Props {
  planilhaStocks: StockPlanilha[];
  watchlistTickers: string[];
  catalogMap: Record<string, StockSearchResult>;
  loading: boolean;
  onTickerClick: (ticker: string) => void;
}

type CellColor = 'green' | 'red' | null;

interface IndicatorDef {
  key: keyof StockPlanilha;
  label: string;
  reference: string;
  description: string;
  format: (value: StockPlanilha[keyof StockPlanilha], stock: StockPlanilha) => string;
  color: (value: StockPlanilha[keyof StockPlanilha], stock: StockPlanilha) => CellColor;
}

const INDICATORS: IndicatorDef[] = [
  {
    key: 'dy',
    label: 'D.Y',
    reference: 'ACIMA DE 6% (QUANTO MAIOR, MELHOR)',
    description: 'Percentual dos dividendos pagos em relação ao preço atual da ação.',
    format: (v) => (v !== null ? `${(v as number).toFixed(1)}%` : '-'),
    color: (v) => (v === null ? null : (v as number) >= 6 ? 'green' : null),
  },
  {
    key: 'crescimentoLucro',
    label: 'Cresc. Lucro',
    reference: 'MÍNIMO DE 12% a.a',
    description: 'Taxa de crescimento anual do lucro líquido da empresa nos últimos anos.',
    format: (v) => (v !== null ? `${(v as number).toFixed(1)}%` : '-'),
    color: (v) => {
      if (v === null) return null;
      const n = v as number;
      return n >= 12 ? 'green' : n < 0 ? 'red' : null;
    },
  },
  {
    key: 'pl',
    label: 'P/L',
    reference: 'DEVE SER MENOR QUE O CRES. LUCRO',
    description: 'Preço da ação dividido pelo lucro por ação. Deve ser menor que o crescimento do lucro.',
    format: (v) => (v !== null ? (v as number).toFixed(1) : '-'),
    color: (v, stock) => {
      if (v === null || stock.crescimentoLucro === null) return null;
      return (v as number) < stock.crescimentoLucro ? 'green' : null;
    },
  },
  {
    key: 'pvpTimesPl',
    label: 'P/VP × P/L',
    reference: 'ABAIXO DE 22,5',
    description: 'Produto do P/VP pelo P/L. Fórmula de Graham para identificar empresas com preço atrativo.',
    format: (v) => (v !== null ? (v as number).toFixed(1) : '-'),
    color: (v) => {
      if (v === null) return null;
      return (v as number) < 22.5 ? 'green' : 'red';
    },
  },
  {
    key: 'margemLiquida',
    label: 'M. Líquida',
    reference: 'SEMPRE POSITIVO (MÍNIMO 15%)',
    description: 'Lucro líquido como percentual da receita. Indica a eficiência operacional da empresa.',
    format: (v) => (v !== null ? `${(v as number).toFixed(1)}%` : '-'),
    color: (v) => {
      if (v === null) return null;
      const n = v as number;
      return n >= 15 ? 'green' : n < 0 ? 'red' : null;
    },
  },
  {
    key: 'roe',
    label: 'ROE',
    reference: 'SEMPRE POSITIVO (MÍNIMO 10%)',
    description: 'Retorno sobre o Patrimônio Líquido. Mede a eficiência no uso do capital dos acionistas.',
    format: (v) => (v !== null ? `${(v as number).toFixed(1)}%` : '-'),
    color: (v) => {
      if (v === null) return null;
      const n = v as number;
      return n >= 10 ? 'green' : n < 0 ? 'red' : null;
    },
  },
  {
    key: 'dividaLiquidaEbitda',
    label: 'Dív.Líq/EBITDA',
    reference: 'DEVE SER MENOR QUE 3,5',
    description: 'Dívida líquida dividida pelo EBITDA. Indica a capacidade da empresa de pagar suas dívidas.',
    format: (v) => (v !== null ? (v as number).toFixed(1) : '-'),
    color: (v) => {
      if (v === null) return null;
      return (v as number) < 3.5 ? 'green' : 'red';
    },
  },
  {
    key: 'acaoVsInflacao',
    label: 'Ação x Inflação',
    reference: 'PRECISA GANHAR DA INFLAÇÃO',
    description: 'Se o retorno histórico da ação supera a inflação acumulada no período analisado.',
    format: (v) => (v === null ? '-' : (v as boolean) ? 'SIM' : 'NÃO'),
    color: (v) => {
      if (v === null) return null;
      return (v as boolean) ? 'green' : 'red';
    },
  },
];

function cellStyle(cellColor: CellColor): React.CSSProperties {
  if (cellColor === 'green') return { color: 'var(--color-green)', fontWeight: 600 };
  if (cellColor === 'red') return { color: 'var(--color-red)', fontWeight: 600 };
  return { color: 'var(--color-text-secondary)' };
}

const thBase: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  background: 'var(--color-surface-2)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '10px 14px',
  whiteSpace: 'nowrap',
};

function DataCell({
  ticker,
  indicator,
  stockMap,
  rowBg,
  opacity,
}: {
  ticker: string;
  indicator: IndicatorDef;
  stockMap: Record<string, StockPlanilha>;
  rowBg: string;
  opacity?: number;
}) {
  const stock = stockMap[ticker];
  if (!stock) {
    return (
      <td
        style={{
          padding: '10px 14px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          background: rowBg,
          opacity: opacity ?? 1,
        }}
      >
        -
      </td>
    );
  }
  const rawValue = stock[indicator.key];
  const displayText = indicator.format(rawValue, stock);
  const c = indicator.color(rawValue, stock);
  const cs = cellStyle(c);
  return (
    <td
      style={{
        padding: '8px 14px',
        textAlign: 'center',
        fontSize: '13px',
        background: rowBg,
        opacity: opacity ?? 1,
      }}
    >
      {displayText === '-' ? (
        <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
      ) : (
        <span
          style={{
            display: 'inline-block',
            padding: c ? '2px 8px' : undefined,
            borderRadius: c ? '4px' : undefined,
            border: c === 'green' ? '1.5px solid var(--color-green)'
                  : c === 'red' ? '1.5px solid var(--color-red)'
                  : undefined,
            color: c ? cs.color : opacity ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontWeight: c ? 600 : 400,
          }}
        >
          {displayText}
        </span>
      )}
    </td>
  );
}

export default function PlanilhaApoioTable({
  planilhaStocks,
  watchlistTickers,
  catalogMap,
  loading,
  onTickerClick,
}: Props) {
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [comparablesBySector, setComparablesBySector] = useState<Record<string, string[]>>({});
  const [comparableStocksMap, setComparableStocksMap] = useState<Record<string, StockPlanilha>>({});
  const [loadingComparables, setLoadingComparables] = useState<Set<string>>(new Set<string>());
  const [legendOpen, setLegendOpen] = useState(true);
  const [pickerState, setPickerState] = useState<{ sector: string; position: number } | null>(null);

  // Refs to read current state inside effects without adding them to deps
  const comparablesBySectorRef = useRef<Record<string, string[]>>({});
  const comparableStocksMapRef = useRef<Record<string, StockPlanilha>>({});
  useEffect(() => { comparablesBySectorRef.current = comparablesBySector; }, [comparablesBySector]);
  useEffect(() => { comparableStocksMapRef.current = comparableStocksMap; }, [comparableStocksMap]);

  const loadComparables = useCallback(async (tickers: string[]) => {
    if (tickers.length === 0) return;
    setLoadingComparables((prev) => new Set<string>([...prev, ...tickers]));
    const results = await Promise.all(tickers.map(fetchPlanilha));
    const newMap: Record<string, StockPlanilha> = {};
    results.forEach((r) => { if (r) newMap[r.ticker] = r; });
    setComparableStocksMap((prev) => ({ ...prev, ...newMap }));
    setLoadingComparables((prev) => {
      const next = new Set<string>(prev);
      tickers.forEach((t) => next.delete(t));
      return next;
    });
  }, []);

  // Auto-assign and load comparables when sector changes
  useEffect(() => {
    if (!activeSector) return;
    const existing = comparablesBySectorRef.current[activeSector];
    if (existing !== undefined) {
      const toLoad = existing.filter((t) => !comparableStocksMapRef.current[t]);
      if (toLoad.length > 0) loadComparables(toLoad);
      return;
    }
    const autoSelected = Object.values(catalogMap)
      .filter((s) => s.setor === activeSector && !watchlistTickers.includes(s.ticker))
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
      .slice(0, 3)
      .map((s) => s.ticker);
    setComparablesBySector((prev) => ({ ...prev, [activeSector]: autoSelected }));
    loadComparables(autoSelected);
  }, [activeSector, catalogMap, watchlistTickers, loadComparables]);

  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    watchlistTickers.forEach((ticker) => {
      const entry = catalogMap[ticker];
      if (entry?.setor) sectorSet.add(entry.setor);
    });
    return Array.from(sectorSet).sort();
  }, [watchlistTickers, catalogMap]);

  // Auto-select first sector; reset to first if current sector disappears
  useEffect(() => {
    if (sectors.length === 0) {
      setActiveSector(null);
    } else if (activeSector === null || !sectors.includes(activeSector)) {
      setActiveSector(sectors[0]);
    }
  }, [sectors]);

  const filteredTickers = useMemo(() => {
    if (!activeSector) return watchlistTickers;
    return watchlistTickers.filter((ticker) => catalogMap[ticker]?.setor === activeSector);
  }, [activeSector, watchlistTickers, catalogMap]);

  const currentComparables = activeSector ? (comparablesBySector[activeSector] ?? []) : [];

  const planilhaMap = useMemo(() => {
    const map: Record<string, StockPlanilha> = {};
    planilhaStocks.forEach((s) => { map[s.ticker] = s; });
    return map;
  }, [planilhaStocks]);

  function handlePickerSelect(ticker: string, position: number) {
    if (!pickerState) return;
    const { sector } = pickerState;
    setPickerState(null);
    setComparablesBySector((prev) => {
      const current = prev[sector] ?? [];
      const updated = [...current];
      updated[position] = ticker;
      return { ...prev, [sector]: updated };
    });
    loadComparables([ticker]);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-shimmer h-10 rounded-xl" />
        ))}
      </div>
    );
  }

  if (watchlistTickers.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
        <p>Nenhum ativo na watchlist.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* PBI-01 — Sector filter pills */}
      {sectors.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                ...(activeSector === sector
                  ? { background: 'var(--color-accent)', color: '#fff', border: '1px solid transparent' }
                  : {
                      background: 'transparent',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }),
              }}
            >
              {sector}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', margin: '-12px', padding: '12px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th
                style={{
                  ...thBase,
                  textAlign: 'left',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  minWidth: 140,
                }}
              >
                Indicador
              </th>

              {/* Watchlist columns */}
              {filteredTickers.map((ticker) => (
                <th
                  key={ticker}
                  style={{ ...thBase, textAlign: 'center', minWidth: 100, cursor: 'pointer' }}
                  onClick={() => onTickerClick(ticker)}
                  title="Abrir detalhes"
                >
                  <span
                    style={{
                      color: 'var(--color-accent)',
                      borderBottom: '1px dotted var(--color-accent)',
                    }}
                  >
                    {ticker}
                  </span>
                </th>
              ))}

              {/* PBI-02 — Comparable columns */}
              {currentComparables.map((ticker, idx) => (
                <th
                  key={`comp-${ticker}`}
                  style={{ ...thBase, textAlign: 'center', minWidth: 120, opacity: 0.7 }}
                >
                  {loadingComparables.has(ticker) ? (
                    <div
                      className="skeleton-shimmer"
                      style={{ height: 14, width: 56, borderRadius: 3, margin: '0 auto' }}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>{ticker}</span>
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          padding: '1px 4px',
                          borderRadius: 3,
                          background: 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        COMP
                      </span>
                      {/* PBI-03 — Edit button */}
                      <button
                        title="Substituir comparável"
                        onClick={() =>
                          activeSector && setPickerState({ sector: activeSector, position: idx })
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1,
                          opacity: 0.7,
                        }}
                      >
                        <Pencil size={10} />
                      </button>
                    </div>
                  )}
                </th>
              ))}

              <th
                style={{
                  ...thBase,
                  textAlign: 'right',
                  minWidth: 260,
                  opacity: 0.7,
                }}
              >
                Referência
              </th>
            </tr>
          </thead>

          <tbody>
            {INDICATORS.map((indicator, rowIdx) => {
              const rowBg = rowIdx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)';
              return (
                <tr key={indicator.key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td
                    style={{
                      padding: '10px 14px',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      background: rowBg,
                      color: 'var(--color-text-primary)',
                      fontWeight: 600,
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {indicator.label}
                  </td>

                  {filteredTickers.map((ticker) => (
                    <DataCell
                      key={ticker}
                      ticker={ticker}
                      indicator={indicator}
                      stockMap={planilhaMap}
                      rowBg={rowBg}
                    />
                  ))}

                  {/* PBI-02 — Comparable cells */}
                  {currentComparables.map((ticker) =>
                    loadingComparables.has(ticker) ? (
                      <td key={`comp-${ticker}`} style={{ padding: '8px 14px', background: rowBg }}>
                        <div
                          className="skeleton-shimmer"
                          style={{ height: 20, borderRadius: 4 }}
                        />
                      </td>
                    ) : (
                      <DataCell
                        key={`comp-${ticker}`}
                        ticker={ticker}
                        indicator={indicator}
                        stockMap={comparableStocksMap}
                        rowBg={rowBg}
                        opacity={0.75}
                      />
                    )
                  )}

                  <td
                    style={{
                      padding: '10px 14px',
                      textAlign: 'right',
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                      opacity: 0.7,
                      whiteSpace: 'nowrap',
                      background: rowBg,
                    }}
                  >
                    {indicator.reference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PBI-04 — Indicator legend card */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setLegendOpen((o) => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--color-surface-2)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}
          >
            Legenda dos Indicadores
          </span>
          {legendOpen ? (
            <ChevronUp size={15} style={{ color: 'var(--color-text-secondary)' }} />
          ) : (
            <ChevronDown size={15} style={{ color: 'var(--color-text-secondary)' }} />
          )}
        </button>

        {legendOpen && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 24px',
            }}
          >
            {INDICATORS.map((ind, i) => (
              <div
                key={ind.key}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < INDICATORS.length - 2 ? '1px solid var(--color-border)' : undefined,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: 'var(--color-text-primary)',
                    minWidth: 100,
                    paddingTop: 1,
                  }}
                >
                  {ind.label}
                </span>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4,
                      display: 'block',
                    }}
                  >
                    {ind.description}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--color-green)',
                      display: 'block',
                      marginTop: 2,
                    }}
                  >
                    {ind.reference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PBI-03 — Comparable picker modal */}
      {pickerState && (
        <ComparablePickerModal
          sector={pickerState.sector}
          position={pickerState.position}
          alreadySelected={comparablesBySector[pickerState.sector] ?? []}
          watchlistTickers={watchlistTickers}
          catalogMap={catalogMap}
          onSelect={handlePickerSelect}
          onClose={() => setPickerState(null)}
        />
      )}
    </div>
  );
}
