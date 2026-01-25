"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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

interface AnalyticsChartsProps {
  dateRange: { startDate: string; endDate: string };
  groupBy: string;
  regionId: string;
  view: "overview" | "trends" | "regional" | "carbon" | "response";
}

const COLORS = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const CHART_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AnalyticsCharts({
  dateRange,
  groupBy,
  regionId,
  view,
}: AnalyticsChartsProps) {
  const [trends, setTrends] = useState<any[]>([]);
  const [regional, setRegional] = useState<any[]>([]);
  const [severity, setSeverity] = useState<any>(null);
  const [carbon, setCarbon] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange, groupBy, regionId, view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(groupBy && { groupBy }),
        ...(regionId && { regionId }),
      });

      // Fetch based on view
      if (view === "overview" || view === "trends") {
        const trendsRes = await fetch(`/api/analytics/trends?${params}`);
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends || []);
      }

      if (view === "overview" || view === "regional") {
        const regionalRes = await fetch(`/api/analytics/regional?${params}`);
        const regionalData = await regionalRes.json();
        setRegional(regionalData.comparisons || []);
      }

      if (view === "overview") {
        const severityRes = await fetch(`/api/analytics/severity?${params}`);
        const severityData = await severityRes.json();
        setSeverity(severityData);
      }

      if (view === "carbon") {
        const carbonRes = await fetch(`/api/analytics/carbon?${params}`);
        const carbonData = await carbonRes.json();
        setCarbon(carbonData);
      }

      if (view === "response") {
        const responseRes = await fetch(`/api/analytics/response-time?${params}`);
        const responseData = await responseRes.json();
        setResponseTime(responseData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading analytics...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview - All Charts */}
      {view === "overview" && (
        <>
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Deforestation Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Alert Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalArea"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Area (ha)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regional.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regionName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="alertCount" fill="#22c55e" name="Alert Count" />
                  <Bar dataKey="totalArea" fill="#3b82f6" name="Total Area (ha)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          {severity && (
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severity.distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {severity.distribution.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.severity as keyof typeof COLORS] || "#8884d8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {severity.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Area Affected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {severity.totalArea.toFixed(2)} ha
                      </p>
                    </div>
                    <div className="space-y-2">
                      {severity.distribution.map((item: any) => (
                        <div
                          key={item.severity}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{item.severity}</span>
                          <span className="text-gray-600">
                            {item.count} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Trends View */}
      {view === "trends" && (
        <Card>
          <CardHeader>
            <CardTitle>Deforestation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Alert Count"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalArea"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Area (ha)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Regional View */}
      {view === "regional" && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={regional}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regionName" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alertCount" fill="#22c55e" name="Alert Count" />
                <Bar dataKey="totalArea" fill="#3b82f6" name="Total Area (ha)" />
                <Bar dataKey="averageArea" fill="#8b5cf6" name="Avg Area (ha)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Carbon View */}
      {view === "carbon" && (
        <>
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                Loading carbon data...
              </CardContent>
            </Card>
          ) : carbon?.error ? (
            <Card>
              <CardContent className="p-8 text-center text-red-600">
                Error: {carbon.error}
              </CardContent>
            </Card>
          ) : carbon?.total ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Area Lost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(carbon.total.areaLost || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">hectares</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Carbon Lost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(carbon.total.carbonLost || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">tons CO2e</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Equivalent Emissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {carbon.total.equivalentEmissions ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Cars:</span>{" "}
                          {(carbon.total.equivalentEmissions.carsPerYear || 0).toFixed(0)}/year
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Homes:</span>{" "}
                          {(carbon.total.equivalentEmissions.homesPerYear || 0).toFixed(0)}/year
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {carbon.byMonth && carbon.byMonth.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Carbon Loss by Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={carbon.byMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="carbonLost" fill="#dc2626" name="Carbon Lost (tons CO2e)" />
                        <Bar dataKey="areaLost" fill="#22c55e" name="Area Lost (ha)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {carbon.byRegion && carbon.byRegion.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Carbon Loss by Region</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={carbon.byRegion}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="regionName" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="carbonLost" fill="#dc2626" name="Carbon Lost (tons CO2e)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {(!carbon.byMonth || carbon.byMonth.length === 0) && 
               (!carbon.byRegion || carbon.byRegion.length === 0) && (
                <Card className="mt-6">
                  <CardContent className="p-8 text-center text-gray-500">
                    No carbon loss data available for the selected period.
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No carbon data available.
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Response Time View */}
      {view === "response" && (
        <>
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                Loading response time data...
              </CardContent>
            </Card>
          ) : responseTime?.error ? (
            <Card>
              <CardContent className="p-8 text-center text-red-600">
                Error: {responseTime.error}
              </CardContent>
            </Card>
          ) : responseTime?.overall ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(responseTime.overall.average || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Median</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(responseTime.overall.median || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>95th Percentile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(responseTime.overall.p95 || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Responded Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {responseTime.respondedAlerts || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      of {responseTime.totalAlerts || 0} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {responseTime.bySeverity && Object.keys(responseTime.bySeverity).length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Response Time by Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(responseTime.bySeverity).map(([severity, stats]: [string, any]) => ({
                          severity,
                          average: stats?.average || 0,
                          median: stats?.median || 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="severity" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" fill="#22c55e" name="Average (hours)" />
                        <Bar dataKey="median" fill="#3b82f6" name="Median (hours)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No response time data available.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
