interface PerformanceSummaryProps {
  summary: {
    portfolio_return: number;
    vnindex_return: number;
    outperformance: number;
    initial_value: number;
    final_value: number;
  };
}

export default function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Portfolio Return */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Portfolio Return</p>
          <p className={`text-2xl font-bold ${getColorClass(summary.portfolio_return)}`}>
            {formatPercent(summary.portfolio_return)}
          </p>
        </div>

        {/* VNIndex Return */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">VNIndex Return</p>
          <p className={`text-2xl font-bold ${getColorClass(summary.vnindex_return)}`}>
            {formatPercent(summary.vnindex_return)}
          </p>
        </div>

        {/* Outperformance */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Outperformance</p>
          <p className={`text-2xl font-bold ${getColorClass(summary.outperformance)}`}>
            {formatPercent(summary.outperformance)}
          </p>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Initial Value</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(summary.initial_value)}
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Current Value</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(summary.final_value)}
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          {summary.outperformance > 0 ? (
            <>
              🎉 <strong>Great job!</strong> Your portfolio outperformed VNIndex by{" "}
              <strong>{Math.abs(summary.outperformance).toFixed(2)}%</strong>
            </>
          ) : summary.outperformance < 0 ? (
            <>
              📉 Your portfolio underperformed VNIndex by{" "}
              <strong>{Math.abs(summary.outperformance).toFixed(2)}%</strong>
            </>
          ) : (
            <>
              ➡️ Your portfolio performed in line with VNIndex
            </>
          )}
        </p>
      </div>
    </div>
  );
}

