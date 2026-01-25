import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "red" | "green" | "blue" | "purple" | "yellow" | "indigo";
}

export function StatCard({ label, value, icon, trend, color = "green" }: StatCardProps) {
  const colorStyles = {
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    yellow: "bg-yellow-50 text-yellow-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className={`text-4xl p-3 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
