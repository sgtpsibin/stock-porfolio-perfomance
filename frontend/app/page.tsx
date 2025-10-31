"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "./components/Navigation";
import PerformanceChart from "./components/PerformanceChart";
import PerformanceSummary from "./components/PerformanceSummary";
import { portfolioStorage, Portfolio } from "./lib/portfolioStorage";

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const periods = [
    { label: "1 Week", days: 7 },
    { label: "1 Month", days: 30 },
    { label: "3 Months", days: 90 },
    { label: "6 Months", days: 180 },
    { label: "1 Year", days: 365 },
    { label: "2 Years", days: 730 },
    { label: "3 Years", days: 1095 },
    { label: "4 Years", days: 1460 },
    { label: "5 Years", days: 1825 },
    { label: "6 Years", days: 2190 },
    { label: "7 Years", days: 2555 },
    { label: "8 Years", days: 2920 },
    { label: "9 Years", days: 3285 },
    { label: "10 Years", days: 3650 },
  ];

  useEffect(() => {
    // Load portfolio from backend
    const loadPortfolio = async () => {
      try {
        const savedPortfolio = await portfolioStorage.get();
        if (savedPortfolio) {
          setPortfolio(savedPortfolio);
        } else {
          const defaultPortfolio = portfolioStorage.getDefaultPortfolio();
          setPortfolio(defaultPortfolio);
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
        const defaultPortfolio = portfolioStorage.getDefaultPortfolio();
        setPortfolio(defaultPortfolio);
      }
    };
    loadPortfolio();
  }, []);

  useEffect(() => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    // Fetch performance when portfolio or period changes
    if (portfolio) {
      const controller = new AbortController();
      setAbortController(controller);
      fetchPerformance(portfolio, selectedPeriod, controller.signal);
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [portfolio, selectedPeriod]);

  const fetchPerformance = async (
    portfolio: Portfolio,
    days: number,
    signal: AbortSignal
  ) => {
    setLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/portfolio/performance?days=${days}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(portfolio),
          signal, // Pass the abort signal to fetch
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio performance");
      }

      const data = await response.json();
      setPerformanceData(data);
      setLoading(false);
    } catch (err) {
      // Don't set error or loading state if request was aborted
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Request was cancelled");
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 My Portfolio Performance
          </h1>
          <p className="text-gray-600">
            Track your default portfolio performance against VNIndex
          </p>
        </header>

        {/* Portfolio Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Current Portfolio
            </h2>
            <Link
              href="/config"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              ⚙️ Edit Portfolio
            </Link>
          </div>

          {portfolio && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.stocks.map((stock, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="text-lg font-bold text-gray-800">
                    {stock.symbol}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stock.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {!portfolio && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No portfolio configured</p>
              <Link
                href="/config"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
              >
                Configure Portfolio
              </Link>
            </div>
          )}
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Time Period</h2>
          <div className="flex flex-wrap gap-3">
            {periods.map(period => (
              <button
                key={period.days}
                onClick={() => setSelectedPeriod(period.days)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.days
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading performance data...</p>
            </div>
          )}

          {performanceData && !loading && (
            <>
              <PerformanceSummary summary={performanceData.summary} />
              <PerformanceChart data={performanceData.data} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
