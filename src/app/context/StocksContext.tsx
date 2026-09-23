import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stock, ALL_STOCKS, calculateMetrics } from '../data/stocks';

interface StocksContextType {
  selectedStocks: Stock[];
  toggleStock: (stockId: string) => void;
  isStockSelected: (stockId: string) => boolean;
}

const StocksContext = createContext<StocksContextType | undefined>(undefined);

export function StocksProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('selectedStocks');
    if (saved) {
      return JSON.parse(saved);
    }
    // Começar com algumas ações pré-selecionadas
    return ['1', '2', '3', '7', '9', '14', '18'];
  });

  const selectedStocks = selectedIds
    .map(id => ALL_STOCKS.find(s => s.id === id))
    .filter((s): s is typeof ALL_STOCKS[0] => s !== undefined)
    .map(calculateMetrics);

  useEffect(() => {
    localStorage.setItem('selectedStocks', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggleStock = (stockId: string) => {
    setSelectedIds(prev => 
      prev.includes(stockId) 
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
    );
  };

  const isStockSelected = (stockId: string) => selectedIds.includes(stockId);

  return (
    <StocksContext.Provider value={{ selectedStocks, toggleStock, isStockSelected }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocks() {
  const context = useContext(StocksContext);
  if (!context) {
    throw new Error('useStocks must be used within StocksProvider');
  }
  return context;
}
