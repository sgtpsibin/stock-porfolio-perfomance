"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  time: string;
  portfolio_value: number;
  vnindex_value: number;
  portfolio_return: number;
  vnindex_return: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Format data for recharts
  // Determine if we need to show year based on data span
  const firstDate = new Date(data[0].time);
  const lastDate = new Date(data[data.length - 1].time);
  const daysDiff = Math.floor(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const showYear = daysDiff > 180; // Show year if span is more than 6 months

  const chartData = data.map(d => {
    const dateObj = new Date(d.time);
    const dateFormat: Intl.DateTimeFormatOptions = showYear
      ? { month: "short", day: "numeric", year: "2-digit" }
      : { month: "short", day: "numeric" };

    return {
      date: dateObj.toLocaleDateString("en-US", dateFormat),
      Portfolio: d.portfolio_return,
      VNIndex: d.vnindex_return,
      fullDate: d.time, // Keep original date for uniqueness
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Performance Chart
      </h2>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{
              value: "Return (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#6b7280" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="Portfolio"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="VNIndex"
            stroke="#eab308"
            strokeWidth={2}
            dot={{ fill: "#eab308", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stats Table */}
      <div className="mt-8 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Recent Performance
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-3 text-gray-700 font-semibold">
                Date
              </th>
              <th className="text-right py-2 px-3 text-gray-700 font-semibold">
                Portfolio
              </th>
              <th className="text-right py-2 px-3 text-gray-700 font-semibold">
                VNIndex
              </th>
              <th className="text-right py-2 px-3 text-gray-700 font-semibold">
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {data
              .slice(-5)
              .reverse()
              .map((d, i) => {
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                };
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 text-gray-600">
                      {formatDate(d.time)}
                    </td>
                    <td
                      className={`text-right py-2 px-3 font-medium ${
                        d.portfolio_return >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.portfolio_return >= 0 ? "+" : ""}
                      {d.portfolio_return.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-2 px-3 font-medium ${
                        d.vnindex_return >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.vnindex_return >= 0 ? "+" : ""}
                      {d.vnindex_return.toFixed(2)}%
                    </td>
                    <td
                      className={`text-right py-2 px-3 font-medium ${
                        d.portfolio_return - d.vnindex_return >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.portfolio_return - d.vnindex_return >= 0 ? "+" : ""}
                      {(d.portfolio_return - d.vnindex_return).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
