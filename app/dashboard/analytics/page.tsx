"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import HotspotMap from "@/components/analytics/HotspotMap";
import ExportButton from "@/components/analytics/ExportButton";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [groupBy, setGroupBy] = useState("month");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive deforestation analytics and predictive insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton dateRange={dateRange} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <Select
              label="Group By"
              options={[
                { value: "day", label: "Daily" },
                { value: "week", label: "Weekly" },
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" },
              ]}
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setDateRange({
                    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                    endDate: new Date().toISOString().split("T")[0],
                  });
                  setGroupBy("month");
                  setSelectedRegion("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "trends", label: "Trends" },
            { id: "regional", label: "Regional" },
            { id: "carbon", label: "Carbon Impact" },
            { id: "response", label: "Response Times" },
            { id: "hotspots", label: "Hotspots" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && (
          <AnalyticsCharts
            dateRange={dateRange}
            groupBy={groupBy}
            regionId={selectedRegion}
            view="overview"
          />
        )}
        {activeTab === "trends" && (
          <AnalyticsCharts
            dateRange={dateRange}
            groupBy={groupBy}
            regionId={selectedRegion}
            view="trends"
          />
        )}
        {activeTab === "regional" && (
          <AnalyticsCharts
            dateRange={dateRange}
            groupBy={groupBy}
            regionId={selectedRegion}
            view="regional"
          />
        )}
        {activeTab === "carbon" && (
          <AnalyticsCharts
            dateRange={dateRange}
            groupBy={groupBy}
            regionId={selectedRegion}
            view="carbon"
          />
        )}
        {activeTab === "response" && (
          <AnalyticsCharts
            dateRange={dateRange}
            groupBy={groupBy}
            regionId={selectedRegion}
            view="response"
          />
        )}
        {activeTab === "hotspots" && (
          <HotspotMap dateRange={dateRange} />
        )}
      </div>
    </div>
  );
}
