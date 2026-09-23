import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, ArrowLeft, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useStocks } from '../context/StocksContext';
import { ALL_STOCKS } from '../data/stocks';
import { NeumorphicCard } from '../components/NeumorphicCard';
import '../styles/neumorphism.css';

const SECTORS = [
  'Todos',
  'Bancos',
  'Petróleo e Gás',
  'Mineração',
  'Bebidas',
  'Máquinas e Equipamentos',
  'Aluguel de Carros',
  'Siderurgia',
  'Papel e Celulose',
  'Transporte',
  'Holding',
  'Alimentos',
  'Energia Elétrica',
  'Telecomunicações',
  'Aeronáutica',
  'Varejo Farmacêutico',
  'Varejo',
  'Shopping Centers',
];

export default function Stocks() {
  const { toggleStock, isStockSelected, selectedStocks } = useStocks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos');

  const filteredStocks = useMemo(() => {
    return ALL_STOCKS.filter(stock => {
      const matchesSearch = 
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = selectedSector === 'Todos' || stock.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  return (
    <div className="min-h-screen hero-gradient" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Header */}
        <NeumorphicCard className="p-6 mb-8" delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748] mb-1">
                Selecionar Ações
              </h1>
              <p className="text-sm text-[#718096]">
                {selectedStocks.length} ativo(s) na sua watchlist
              </p>
            </div>
            <Link
              to="/"
              className="neu-button-raised px-6 py-3 gradient-accent text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Dashboard</span>
            </Link>
          </div>
        </NeumorphicCard>

        {/* Search Input */}
        <NeumorphicCard className="p-6 mb-6" delay={0.1}>
          <div className="neu-inset px-4 py-3 flex items-center gap-3">
            <Search className="w-5 h-5 text-[#718096]" />
            <input
              type="text"
              placeholder="BUSCAR POR TICKER OU NOME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-[#2D3748] placeholder:text-[#718096] uppercase"
            />
          </div>
        </NeumorphicCard>

        {/* Sector Filters */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {SECTORS.map((sector, index) => (
              <motion.button
                key={sector}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.02 }}
                onClick={() => setSelectedSector(sector)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSector === sector
                    ? 'neu-inset gradient-accent text-white'
                    : 'neu-button-raised text-[#2D3748]'
                }`}
              >
                {sector}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {filteredStocks.map((stock, index) => {
            const selected = isStockSelected(stock.id);
            
            return (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.03 }}
              >
                <div
                  className={`neu-raised neu-raised-hover p-6 ${
                    selected ? 'border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold gradient-text text-lg mb-1">
                        {stock.ticker}
                      </h3>
                      <p className="text-[#2D3748] text-sm mb-1">
                        {stock.name}
                      </p>
                      <p className="text-[#718096] text-xs">
                        {stock.sector}
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-[#718096]">Preço</p>
                          <p className="text-[#2D3748] font-semibold">
                            R$ {stock.currentPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#718096]">Dividend Yield</p>
                          <p className={`font-semibold ${stock.dividendYield >= 6 ? 'text-[#10B981]' : 'text-[#2D3748]'}`}>
                            {stock.dividendYield.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[#718096]">LPA</p>
                          <p className="text-[#2D3748] font-semibold">
                            {stock.lpa.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStock(stock.id)}
                      className={`ml-4 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selected
                          ? 'bg-gradient-to-r from-red-400 to-red-600 text-white neu-raised'
                          : 'gradient-accent text-white neu-button-raised'
                      }`}
                    >
                      {selected ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Remover
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredStocks.length === 0 && (
          <NeumorphicCard className="p-12 text-center" delay={0.2}>
            <p className="text-[#718096] text-lg">
              Nenhuma ação encontrada com os filtros aplicados.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  );
}
