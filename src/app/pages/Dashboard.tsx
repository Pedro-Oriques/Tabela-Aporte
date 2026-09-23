import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, ArrowRight, TrendingUp, X } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStocks } from '../context/StocksContext';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { CountUpNumber } from '../components/CountUpNumber';
import { Stock } from '../data/stocks';
import '../styles/neumorphism.css';

type SortColumn = keyof Stock | null;
type SortDirection = 'asc' | 'desc';

export default function Dashboard() {
  const { selectedStocks, toggleStock } = useStocks();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('classification');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calcular contadores por classificação
  const counts = useMemo(() => {
    return {
      aporteForte: selectedStocks.filter(s => s.classification === 'APORTE FORTE').length,
      aporte: selectedStocks.filter(s => s.classification === 'APORTE').length,
      aportePequeno: selectedStocks.filter(s => s.classification === 'APORTE PEQUENO').length,
      naoComprar: selectedStocks.filter(s => s.classification === 'NÃO COMPRAR').length,
    };
  }, [selectedStocks]);

  // Dados do gráfico (distribuição ao longo do tempo - mock)
  const chartData = useMemo(() => {
    return [
      { month: 'Jan', value: 12 },
      { month: 'Fev', value: 15 },
      { month: 'Mar', value: 13 },
      { month: 'Abr', value: 18 },
      { month: 'Mai', value: 22 },
      { month: 'Jun', value: 20 },
    ];
  }, []);

  // Filtrar e ordenar ações
  const filteredAndSortedStocks = useMemo(() => {
    let filtered = selectedStocks.filter(stock =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [selectedStocks, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getClassificationStyle = (classification: Stock['classification']) => {
    switch (classification) {
      case 'APORTE FORTE':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white pulse-glow';
      case 'APORTE':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'APORTE PEQUENO':
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-gray-800';
      case 'NÃO COMPRAR':
        return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
    }
  };

  return (
    <div className="min-h-screen hero-gradient" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Hero Top Bar */}
        <NeumorphicCard className="p-6 mb-8" delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748] mb-1">
                E agora? Será que eu aporto?
              </h1>
              <p className="text-[13px] text-[#718096]">
                Modelo Graham & Bazin
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="neu-inset px-4 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#718096]" />
                <input
                  type="text"
                  placeholder="Buscar ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-[#2D3748] placeholder:text-[#718096] w-48"
                />
              </div>
              <Link
                to="/stocks"
                className="flex items-center gap-2 text-sm text-[#718096] hover:text-[#2D3748] transition-colors"
              >
                <span>Gerenciar Ações</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </NeumorphicCard>

        {/* Summary Strip */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <NeumorphicCard className="p-6 border-t-4 border-emerald-500" delay={0.1} hover>
            <CountUpNumber 
              value={counts.aporteForte} 
              delay={0.1}
              className="text-[32px] font-bold text-emerald-500 block"
            />
            <p className="text-sm text-[#718096] mt-2">Aporte Forte</p>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 border-t-4 border-blue-500" delay={0.2} hover>
            <CountUpNumber 
              value={counts.aporte} 
              delay={0.2}
              className="text-[32px] font-bold text-blue-500 block"
            />
            <p className="text-sm text-[#718096] mt-2">Aporte</p>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 border-t-4 border-amber-500" delay={0.3} hover>
            <CountUpNumber 
              value={counts.aportePequeno} 
              delay={0.3}
              className="text-[32px] font-bold text-amber-500 block"
            />
            <p className="text-sm text-[#718096] mt-2">Aporte Pequeno</p>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 border-t-4 border-red-500" delay={0.4} hover>
            <CountUpNumber 
              value={counts.naoComprar} 
              delay={0.4}
              className="text-[32px] font-bold text-red-500 block"
            />
            <p className="text-sm text-[#718096] mt-2">Não Comprar</p>
          </NeumorphicCard>
        </div>

        {/* Chart Widget */}
        <NeumorphicCard className="p-6 mb-8" delay={0.5}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 gradient-text" />
            <h2 className="text-lg font-semibold text-[#2D3748]">
              Distribuição de Potencial
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#718096', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#718096', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  background: '#E0E5EC',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '6px 6px 12px #A3B1C6, -6px -6px 12px #FFFFFF',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#colorValueGradient)"
                strokeWidth={3}
                fill="url(#colorValueGradient)"
                fillOpacity={0.2}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        {/* Main Data Table */}
        <NeumorphicCard className="p-6" delay={0.6}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D1D9E6]">
                  <th className="text-left p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ticker')}>
                    ATIVO {sortColumn === 'ticker' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('currentPrice')}>
                    ATUAL (R$) {sortColumn === 'currentPrice' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('avg5Years')}>
                    MÉD. 5A {sortColumn === 'avg5Years' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('lpa')}>
                    LPA {sortColumn === 'lpa' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('vpa')}>
                    VPA {sortColumn === 'vpa' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('dividendYield')}>
                    REND. (%) {sortColumn === 'dividendYield' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ceiling')}>
                    TETO (R$) {sortColumn === 'ceiling' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('graham')}>
                    GRAHAM {sortColumn === 'graham' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('marginOfSafety')}>
                    M. SEG. (%) {sortColumn === 'marginOfSafety' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-right p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('potential')}>
                    POTENCIAL {sortColumn === 'potential' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-left p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('classification')}>
                    CLASSIFICAÇÃO {sortColumn === 'classification' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="text-center p-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStocks.map((stock, index) => (
                  <motion.tr
                    key={stock.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`table-row-hover ${index % 2 === 0 ? 'bg-[#E0E5EC]' : 'bg-[#E8EDF5]'}`}
                  >
                    <td className="p-3">
                      <span className="font-bold gradient-text">{stock.ticker}</span>
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.currentPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.avg5Years.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.lpa.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.vpa.toFixed(2)}
                    </td>
                    <td className={`p-3 text-right ${stock.dividendYield >= 6 ? 'text-[#10B981]' : 'text-[#2D3748]'}`}>
                      {stock.dividendYield.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.ceiling.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-[#2D3748]">
                      {stock.graham.toFixed(2)}
                    </td>
                    <td className={`p-3 text-right ${stock.marginOfSafety >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {stock.marginOfSafety.toFixed(1)}%
                    </td>
                    <td className={`p-3 text-right ${stock.potential >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {stock.potential.toFixed(1)}%
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold neu-raised ${getClassificationStyle(stock.classification)}`}>
                        {stock.classification}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleStock(stock.id)}
                        className="neu-button-raised w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:text-red-600"
                        title="Remover ação"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedStocks.length === 0 && (
              <div className="text-center py-12 text-[#718096]">
                <p>Nenhuma ação encontrada.</p>
                <Link to="/stocks" className="gradient-text mt-2 inline-block">
                  Adicionar ações à watchlist
                </Link>
              </div>
            )}
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}