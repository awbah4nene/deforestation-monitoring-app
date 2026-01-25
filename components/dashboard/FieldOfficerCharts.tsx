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

interface ReportTrend {
  date: string;
  count: number;
}

interface AlertStatus {
  status: string;
  count: number;
}

interface RegionPerformance {
  region: string;
  verified: number;
  pending: number;
}

interface FieldOfficerChartsProps {
  reportTrends: ReportTrend[];
  alertStatus: AlertStatus[];
  regionPerformance: RegionPerformance[];
  myAlerts: Array<{
    severity: string;
    status: string;
  }>;
}

const COLORS = ["#dc2626", "#ea580c", "#eab308", "#22c55e"];

export default function FieldOfficerCharts({
  reportTrends,
  alertStatus,
  regionPerformance,
  myAlerts,
}: FieldOfficerChartsProps) {
  // Count alerts by severity
  const severityCounts = myAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = Object.entries(severityCounts).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* My Reports Over Time */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          My Field Reports (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportTrends}>
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
              stroke="#3b82f6"
              strokeWidth={2}
              name="Reports Submitted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          My Alerts by Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={alertStatus}
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
              {alertStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Severity Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Assigned Alerts by Severity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#dc2626" name="Alerts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Region Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Verification Performance by Region
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="verified" stackId="a" fill="#22c55e" name="Verified" />
            <Bar dataKey="pending" stackId="a" fill="#eab308" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
