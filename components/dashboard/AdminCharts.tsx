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

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

interface StatusData {
  status: string;
  count: number;
}

interface RegionData {
  region: string;
  alerts: number;
}

interface AdminChartsProps {
  alertTrends: AlertTrend[];
  severityData: SeverityData[];
  statusData: StatusData[];
  regionData: RegionData[];
}

const COLORS = ["#dc2626", "#ea580c", "#eab308", "#22c55e"];

export default function AdminCharts({
  alertTrends,
  severityData,
  statusData,
  regionData,
}: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alerts Over Time */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alerts Detected Over Time (Last 30 Days)
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

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alert Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" name="Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Comparison */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alerts by Region
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="region" type="category" tick={{ fontSize: 12 }} width={120} />
            <Tooltip />
            <Bar dataKey="alerts" fill="#22c55e" name="Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
