"use client";

import { useState } from "react";
import Navigation from "../components/Navigation";
import PortfolioForm from "../components/PortfolioForm";
import PerformanceChart from "../components/PerformanceChart";
import PerformanceSummary from "../components/PerformanceSummary";

export default function CustomPage() {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const handlePortfolioSubmit = async (portfolio: any, days: number) => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller);

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
          signal: controller.signal, // Pass the abort signal
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
            🔍 Custom Portfolio Analysis
          </h1>
          <p className="text-gray-600">
            Analyze any portfolio composition against VNIndex
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Input Form */}
          <div className="lg:col-span-1">
            <PortfolioForm onSubmit={handlePortfolioSubmit} loading={loading} />
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Calculating performance...</p>
              </div>
            )}

            {performanceData && !loading && (
              <>
                <PerformanceSummary summary={performanceData.summary} />
                <PerformanceChart data={performanceData.data} />
              </>
            )}

            {!performanceData && !loading && !error && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to analyze
                </h3>
                <p className="text-gray-500">
                  Enter your stock holdings on the left to see how the portfolio
                  performs against VNIndex
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
