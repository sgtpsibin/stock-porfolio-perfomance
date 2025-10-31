"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { portfolioStorage, Stock } from "../lib/portfolioStorage";

export default function ConfigPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved portfolio or use default
    const loadPortfolio = async () => {
      try {
        const savedPortfolio = await portfolioStorage.get();
        if (savedPortfolio) {
          setStocks(savedPortfolio.stocks);
        } else {
          const defaultPortfolio = portfolioStorage.getDefaultPortfolio();
          setStocks(defaultPortfolio.stocks);
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
        const defaultPortfolio = portfolioStorage.getDefaultPortfolio();
        setStocks(defaultPortfolio.stocks);
      }
    };
    loadPortfolio();
  }, []);

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
    setSaved(false);
  };

  const getTotalPercentage = () => {
    return stocks.reduce((sum, stock) => sum + (stock.percentage || 0), 0);
  };

  const handleSave = async () => {
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

    try {
      await portfolioStorage.set({ stocks: validStocks });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(`Failed to save portfolio: ${error}`);
    }
  };

  const handleReset = async () => {
    if (confirm("Reset to default portfolio?")) {
      const defaultPortfolio = portfolioStorage.getDefaultPortfolio();
      setStocks(defaultPortfolio.stocks);
      try {
        await portfolioStorage.set(defaultPortfolio);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (error) {
        alert(`Failed to reset portfolio: ${error}`);
      }
    }
  };

  const quickAddStocks = [
    "VNM",
    "VIC",
    "HPG",
    "TCB",
    "VHM",
    "MSN",
    "VPB",
    "FPT",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              ⚙️ Portfolio Configuration
            </h1>
            {saved && (
              <span className="text-green-600 font-medium animate-pulse">
                ✓ Saved!
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">
            Configure your default portfolio. This will be used on the home page
            to track your performance.
          </p>

          {/* Portfolio Form */}
          <div className="space-y-4">
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
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Symbol (e.g., VNM)"
                  value={stock.symbol}
                  onChange={e =>
                    updateStock(index, "symbol", e.target.value.toUpperCase())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeStock(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addStock}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              + Add Stock
            </button>

            {/* Quick Add Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {quickAddStocks.map(symbol => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() =>
                      setStocks([...stocks, { symbol, percentage: 10 }])
                    }
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                💾 Save Portfolio
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                🔄 Reset to Default
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Your portfolio is saved on the server and
              shared across all users. Changes will be visible to everyone
              viewing the home page. The total percentage can be less than 100%
              if you want to keep some cash allocation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
