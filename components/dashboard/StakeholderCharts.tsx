"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AlertTrend {
  date: string;
  count: number;
}

interface DistrictData {
  district: string;
  alerts: number;
}

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

interface StakeholderChartsProps {
  alertTrends: AlertTrend[];
  districtData: DistrictData[];
  severityData: SeverityData[];
  regionSummary: Array<{
    district: string;
    _count: { _all: number };
    _sum: { areaHectares: number | null };
  }>;
}

const COLORS = ["#dc2626", "#ea580c", "#eab308", "#22c55e"];

export default function StakeholderCharts({
  alertTrends,
  districtData,
  severityData,
  regionSummary,
}: StakeholderChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alert Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Deforestation Alerts Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={alertTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#dc2626"
              strokeWidth={2}
              name="Alerts"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alert Severity Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* District Coverage */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Forest Coverage by District
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionSummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="district"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="_sum.areaHectares"
              fill="#22c55e"
              name="Area (ha)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts by District */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Alerts by District
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="district"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="alerts" fill="#dc2626" name="Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
