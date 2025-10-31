"use client";

import { useState } from "react";

interface Stock {
  symbol: string;
  percentage: number;
}

interface PortfolioFormProps {
  onSubmit: (portfolio: { stocks: Stock[] }, days: number) => void;
  loading: boolean;
}

export default function PortfolioForm({
  onSubmit,
  loading,
}: PortfolioFormProps) {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "", percentage: 0 },
  ]);
  const [days, setDays] = useState(30);

  const addStock = () => {
    setStocks([...stocks, { symbol: "", percentage: 0 }]);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const updateStock = (
    index: number,
    field: keyof Stock,
    value: string | number
  ) => {
    const newStocks = [...stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setStocks(newStocks);
  };

  const getTotalPercentage = () => {
    return stocks.reduce((sum, stock) => sum + (stock.percentage || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validStocks = stocks.filter(s => s.symbol && s.percentage > 0);
    const totalPercentage = getTotalPercentage();

    if (validStocks.length === 0) {
      alert("Please add at least one stock with a percentage");
      return;
    }

    if (totalPercentage > 100) {
      alert(`Total percentage (${totalPercentage.toFixed(1)}%) exceeds 100%`);
      return;
    }

    onSubmit({ stocks: validStocks }, days);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Portfolio</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Time Period Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last 1 year</option>
            <option value={730}>Last 2 years</option>
            <option value={1095}>Last 3 years</option>
            <option value={1460}>Last 4 years</option>
            <option value={1825}>Last 5 years</option>
            <option value={2190}>Last 6 years</option>
            <option value={2555}>Last 7 years</option>
            <option value={2920}>Last 8 years</option>
            <option value={3285}>Last 9 years</option>
            <option value={3650}>Last 10 years</option>
          </select>
        </div>

        {/* Stock Inputs */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Stocks (% of NAV)
            </label>
            <span
              className={`text-sm font-medium ${
                getTotalPercentage() > 100
                  ? "text-red-600"
                  : getTotalPercentage() === 100
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              Total: {getTotalPercentage().toFixed(1)}%
            </span>
          </div>

          {stocks.map((stock, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Symbol (e.g., VNM)"
                value={stock.symbol}
                onChange={e =>
                  updateStock(index, "symbol", e.target.value.toUpperCase())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="relative w-32">
                <input
                  type="number"
                  placeholder="% NAV"
                  min="0"
                  max="100"
                  step="0.1"
                  value={stock.percentage || ""}
                  onChange={e =>
                    updateStock(index, "percentage", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {stocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStock(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addStock}
            className="w-full px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            + Add Stock
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "Analyzing..." : "Analyze Performance"}
        </button>
      </form>

      {/* Example Stocks */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">
          Popular Vietnamese stocks (click to add):
        </p>
        <div className="flex flex-wrap gap-2">
          {["VNM", "VIC", "VHM", "HPG", "TCB", "VCB"].map(symbol => (
            <button
              key={symbol}
              type="button"
              onClick={() => {
                const emptyIndex = stocks.findIndex(s => !s.symbol);
                if (emptyIndex !== -1) {
                  updateStock(emptyIndex, "symbol", symbol);
                } else {
                  setStocks([...stocks, { symbol, percentage: 10 }]);
                }
              }}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {symbol}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Tip: Allocate percentages to match your portfolio (total ≤ 100%)
        </p>
      </div>
    </div>
  );
}
