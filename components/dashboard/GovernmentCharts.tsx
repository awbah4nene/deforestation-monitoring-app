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
  area: number;
}

interface ComplianceData {
  status: string;
  count: number;
}

interface GovernmentChartsProps {
  alertTrends: AlertTrend[];
  districtData: DistrictData[];
  complianceData: ComplianceData[];
  regionStats: Array<{
    name: string;
    district: string;
    alerts: number;
    area: number;
  }>;
}

const COLORS = ["#dc2626", "#ea580c", "#eab308", "#22c55e", "#3b82f6"];

export default function GovernmentCharts({
  alertTrends,
  districtData,
  complianceData,
  regionStats,
}: GovernmentChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alerts by District */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alerts by District (Last 30 Days)
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
            <Legend />
            <Bar dataKey="alerts" fill="#dc2626" name="Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alert Compliance Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={complianceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percent }) =>
                `${status}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {complianceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alert Detection Trends (Last 30 Days)
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
              name="Alerts Detected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Regions by Alerts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Regions Requiring Attention
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip />
            <Bar dataKey="alerts" fill="#ea580c" name="Active Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
