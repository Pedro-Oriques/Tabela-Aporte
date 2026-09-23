"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StockValuation, StockSearchResult, StockPlanilha } from "@/lib/types";
import { fetchValuation, fetchPlanilha, getCatalog } from "@/lib/api";
import { getWatchlist, saveWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/cookies";
import ValuationTable from "@/components/dashboard/ValuationTable";
import PlanilhaApoioTable from "@/components/dashboard/PlanilhaApoioTable";
import SearchBar from "@/components/SearchBar";
import DetailDrawer from "@/components/dashboard/DetailDrawer";

type ActiveTab = "graham" | "planilha";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("graham");
  const [stocks, setStocks] = useState<StockValuation[]>([]);
  const [planilhaStocks, setPlanilhaStocks] = useState<StockPlanilha[]>([]);
  const [planilhaLoaded, setPlanilhaLoaded] = useState(false);
  const [catalog, setCatalog] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [planilhaLoading, setPlanilhaLoading] = useState(false);
  const [loadingTicker, setLoadingTicker] = useState<string | null>(null);
  const [selected, setSelected] = useState<StockValuation | null>(null);

  const catalogMap = Object.fromEntries(catalog.map((s) => [s.ticker, s]));

  useEffect(() => {
    document.documentElement.classList.add("warm-obsidian");
    return () => document.documentElement.classList.remove("warm-obsidian");
  }, []);

  const loadStocks = useCallback(async (tickers: string[]) => {
    setLoading(true);
    const results = await Promise.all(tickers.map(fetchValuation));
    setStocks(results.filter((r): r is StockValuation => r !== null));
    setLoading(false);
  }, []);

  const loadPlanilhaStocks = useCallback(async (tickers: string[]) => {
    setPlanilhaLoading(true);
    const results = await Promise.all(tickers.map(fetchPlanilha));
    setPlanilhaStocks(results.filter((r): r is StockPlanilha => r !== null));
    setPlanilhaLoading(false);
    setPlanilhaLoaded(true);
  }, []);

  useEffect(() => {
    getCatalog().then((data) => {
      setCatalog(data);
      const validTickers = new Set(data.map((s) => s.ticker));
      const saved = getWatchlist();
      const cleaned = saved.filter((t) => validTickers.has(t));
      if (cleaned.length !== saved.length) saveWatchlist(cleaned);
      loadStocks(cleaned);
    });
  }, [loadStocks]);

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
    if (tab === "planilha" && !planilhaLoaded) {
      const tickers = stocks.map((s) => s.ticker);
      if (tickers.length > 0) loadPlanilhaStocks(tickers);
      else setPlanilhaLoaded(true);
    }
  }

  async function handleAdd(stock: StockSearchResult) {
    if (stocks.some((s) => s.ticker === stock.ticker)) return;
    setLoadingTicker(stock.ticker);
    const data = await fetchValuation(stock.ticker);
    if (data) {
      setStocks((prev) => [data, ...prev]);
      addToWatchlist(stock.ticker);
      if (activeTab === "planilha" || planilhaLoaded) {
        const planilha = await fetchPlanilha(stock.ticker);
        if (planilha) setPlanilhaStocks((prev) => [planilha, ...prev]);
      }
    }
    setLoadingTicker(null);
  }

  function handleRemove(ticker: string) {
    setStocks((prev) => prev.filter((s) => s.ticker !== ticker));
    setPlanilhaStocks((prev) => prev.filter((s) => s.ticker !== ticker));
    removeFromWatchlist(ticker);
    if (selected?.ticker === ticker) setSelected(null);
  }

  const watchlistTickers = stocks.map((s) => s.ticker);

  return (
    <div className="min-h-screen py-12 px-8" style={{ background: "var(--color-bg)" }}>
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-accent)" }}>
              Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Análise fundamentalista de ações brasileiras
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <SearchBar
              onSelect={handleAdd}
              placeholder={loadingTicker ? `Carregando ${loadingTicker}...` : "Adicionar ativo..."}
            />
            <Link
              href="/stocks"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span>Gerenciar Ações</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
          className="flex gap-2"
        >
          <button
            onClick={() => handleTabChange("graham")}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={
              activeTab === "graham"
                ? { background: "var(--color-accent)", color: "#fff" }
                : { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }
            }
          >
            Graham &amp; Bazin
          </button>
          <button
            onClick={() => handleTabChange("planilha")}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={
              activeTab === "planilha"
                ? { background: "var(--color-accent)", color: "#fff" }
                : { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }
            }
          >
            Planilha de Apoio
          </button>
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeTab === "graham" ? (
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                Graham &amp; Bazin
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Visualize métricas de valuation fundamentalista e identifique oportunidades de compra com margem de segurança, usando os critérios de Benjamin Graham e Décio Bazin.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                Planilha de Apoio
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Compare indicadores financeiros dos seus ativos lado a lado com empresas do mesmo setor, avaliando qualidade e eficiência operacional de forma estruturada.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="card p-6"
          style={{ borderTop: "3px solid var(--color-accent)" }}
        >
          {activeTab === "graham" ? (
            loading ? (
              <div className="flex flex-col gap-4 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-shimmer h-10 rounded-xl" />
                ))}
              </div>
            ) : stocks.length === 0 ? (
              <EmptyState />
            ) : (
              <ValuationTable stocks={stocks} onRemove={handleRemove} onRowClick={setSelected} />
            )
          ) : (
            <PlanilhaApoioTable
              planilhaStocks={planilhaStocks}
              watchlistTickers={watchlistTickers}
              catalogMap={catalogMap}
              loading={planilhaLoading || (!planilhaLoaded && stocks.length > 0)}
              onTickerClick={(ticker: string) => {
                const stock = stocks.find((s) => s.ticker === ticker);
                if (stock) setSelected(stock);
              }}
            />
          )}
        </motion.div>
      </div>

      <DetailDrawer
        stock={selected}
        catalogEntry={selected ? (catalogMap[selected.ticker] ?? null) : null}
        onClose={() => setSelected(null)}
        onRemove={handleRemove}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Nenhum ativo selecionado
      </p>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
        Escolha as ações que deseja acompanhar para visualizar o valuation.
      </p>
      <Link href="/stocks">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-4 rounded-lg text-white font-semibold flex items-center gap-2 mx-auto"
          style={{ background: "var(--color-accent)", borderRadius: "var(--radius-btn)" }}
        >
          <ArrowRight className="w-5 h-5" />
          Selecionar Ações
        </motion.button>
      </Link>
    </div>
  );
}
