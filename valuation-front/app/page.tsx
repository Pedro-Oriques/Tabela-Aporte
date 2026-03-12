"use client";

import { useState, useEffect, useMemo } from "react";

interface StockValuation {
  ticker: string;
  valorAtual: number;
  mediaDividendos5Anos: number;
  ultimoDividendo: number;
  lpa: number;
  vpa: number;
  rendimentoDesejado: number;
  precoTeto: number;
  graham: number;
  precoJusto: number;
  premioDeRisco: number;
  precoJustoAjustado: number;
  margemSeguranca: number;
  margemSegurancaAjustada: number;
  distanciaPrecoTeto: number;
  potencialValorizacao: number;
  classificacaoAporte: string;
}

const DEFAULT_TICKERS = [
  "BBAS3",
  "BBSE3",
  "PETR4",
  "SAPR11",
  "CMIG4",
  "CSMG3",
  "TAEE11",
  "ABCB4",
  "RANI3",
  "ISAE4",
  "FIQE3",
];

type SortConfig = {
  key: keyof StockValuation;
  direction: "asc" | "desc";
} | null;

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockValuation[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const fetchStockData = async (ticker: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/stocks/valuation/${ticker}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Falha ao buscar dados");
      return (await res.json()) as StockValuation;
    } catch (error) {
      console.error(`Erro buscando ${ticker}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadDefaultStocks = async () => {
      setLoading(true);
      const promises = DEFAULT_TICKERS.map((ticker) => fetchStockData(ticker));
      const results = await Promise.all(promises);
      setStocks(results.filter((res): res is StockValuation => res !== null));
      setLoading(false);
    };
    loadDefaultStocks();
  }, []);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker) return;
    setLoading(true);
    const data = await fetchStockData(newTicker.toUpperCase());
    if (data) {
      setStocks((prev) =>
        prev.some((s) => s.ticker === data.ticker) ? prev : [data, ...prev],
      );
      setNewTicker("");
    } else {
      alert("Ativo não encontrado ou erro na API.");
    }
    setLoading(false);
  };

  const requestSort = (key: keyof StockValuation) => {
    let direction: "asc" | "desc" = "desc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = useMemo(() => {
    const sortableItems = [...stocks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [stocks, sortConfig]);

  const formatColor = (val: number) => {
    if (val > 0) return "text-green-400";
    if (val < 0) return "text-red-400";
    return "text-gray-300";
  };

  const getClassificacaoBadge = (classificacao: string) => {
    switch (classificacao) {
      case "Aporte Forte":
        return "bg-green-600 text-white border-green-500";
      case "Aporte":
        return "bg-green-800 text-green-100 border-green-700";
      case "Aporte Pequeno":
        return "bg-yellow-600 text-yellow-100 border-yellow-500";
      case "Não Comprar":
        return "bg-red-700 text-red-100 border-red-600";
      default:
        return "bg-gray-700 text-gray-200 border-gray-600";
    }
  };

  const SortableHeader = ({
    label,
    sortKey,
    extraClass = "",
  }: {
    label: string;
    sortKey: keyof StockValuation;
    extraClass?: string;
  }) => (
    <th
      className={`px-2 py-3 cursor-pointer hover:bg-gray-700 transition-colors group select-none border-b border-gray-700 whitespace-nowrap ${extraClass}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-gray-500 group-hover:text-gray-300 text-[10px]">
          {sortConfig?.key === sortKey
            ? sortConfig.direction === "asc"
              ? "▲"
              : "▼"
            : "↕"}
        </span>
      </div>
    </th>
  );

  return (
    <main className="min-h-screen bg-[#121214] text-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              E agora? Será que eu aporto?
            </h1>
            <p className="text-sm text-gray-400">Modelo Graham & Bazin</p>
          </div>
          <form onSubmit={handleAddTicker} className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: WEGE3"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 text-sm rounded border border-gray-700 focus:outline-none focus:border-blue-500 uppercase w-32"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm rounded font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Adicionar"}
            </button>
          </form>
        </header>

        <div className="bg-[#202024] rounded-lg shadow-xl overflow-x-auto border border-gray-800">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#121214] text-gray-400 uppercase">
              <tr>
                <th className="px-5 py-3 text-left border-b border-gray-700">
                  Ativo
                </th>
                <SortableHeader label="Atual (R$)" sortKey="valorAtual" />
                <SortableHeader
                  label="Méd. 5a (R$)"
                  sortKey="mediaDividendos5Anos"
                />
                <SortableHeader label="LPA" sortKey="lpa" />
                <SortableHeader label="VPA" sortKey="vpa" />
                <SortableHeader
                  label="Rend. (%)"
                  sortKey="rendimentoDesejado"
                />
                <SortableHeader label="Teto (R$)" sortKey="precoTeto" />
                <SortableHeader label="Graham" sortKey="graham" />
                <SortableHeader label="P. Justo (R$)" sortKey="precoJusto" />
                <SortableHeader label="Risco (%)" sortKey="premioDeRisco" />
                <SortableHeader
                  label="Justo Aj. (R$)"
                  sortKey="precoJustoAjustado"
                />
                <SortableHeader label="M. Seg. (%)" sortKey="margemSeguranca" />
                <SortableHeader
                  label="M. Aj. (%)"
                  sortKey="margemSegurancaAjustada"
                />
                <SortableHeader
                  label="Dist. Teto"
                  sortKey="distanciaPrecoTeto"
                />
                <SortableHeader
                  label="Potencial"
                  sortKey="potencialValorizacao"
                />
                {/* Cabeçalho que estava faltando foi adicionado aqui: */}
                <th className="px-6 py-3 text-center border-b border-gray-700 min-w-[140px]">
                  Classificação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedStocks.map((stock) => (
                <tr
                  key={stock.ticker}
                  className="hover:bg-[#29292e] transition-colors"
                >
                  <td className="px-3 py-3 text-left font-bold text-blue-400">
                    {stock.ticker}
                  </td>
                  <td className="px-2 py-3">R$ {stock.valorAtual}</td>
                  <td className="px-2 py-3">R$ {stock.mediaDividendos5Anos}</td>
                  <td className="px-2 py-3">{stock.lpa}</td>
                  <td className="px-2 py-3">{stock.vpa}</td>
                  <td className="px-2 py-3 text-gray-500">
                    {stock.rendimentoDesejado}%
                  </td>
                  <td className="px-2 py-3 font-semibold text-purple-400">
                    R$ {stock.precoTeto}
                  </td>
                  <td className="px-2 py-3 text-gray-500">{stock.graham}</td>
                  <td className="px-2 py-3 font-semibold text-yellow-400">
                    R$ {stock.precoJusto}
                  </td>
                  <td className="px-2 py-3 text-gray-500">
                    {stock.premioDeRisco}%
                  </td>
                  <td className="px-2 py-3 font-semibold text-blue-300">
                    R$ {stock.precoJustoAjustado}
                  </td>

                  <td
                    className={`px-2 py-3 font-medium ${formatColor(stock.margemSeguranca)}`}
                  >
                    {stock.margemSeguranca}%
                  </td>
                  <td
                    className={`px-2 py-3 font-medium ${formatColor(stock.margemSegurancaAjustada)}`}
                  >
                    {stock.margemSegurancaAjustada}%
                  </td>
                  <td
                    className={`px-2 py-3 font-medium ${formatColor(stock.distanciaPrecoTeto)}`}
                  >
                    {stock.distanciaPrecoTeto}%
                  </td>
                  <td
                    className={`px-2 py-3 font-medium ${formatColor(stock.potencialValorizacao)}`}
                  >
                    {stock.potencialValorizacao}%
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-bold border ${getClassificacaoBadge(stock.classificacaoAporte)}`}
                    >
                      {stock.classificacaoAporte}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedStocks.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Nenhum ativo carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
