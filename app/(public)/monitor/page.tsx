"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
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

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

interface PublicAlert {
  id: string;
  alertCode: string;
  severity: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  detectedDate: string;
  forestRegion: {
    name: string;
    district: string;
  };
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function PublicMonitorPage() {
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    totalArea: 0,
    regionsMonitored: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch public alerts
      const alertsRes = await fetch("/api/public/alerts");
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);

      // Fetch statistics
      const statsRes = await fetch("/api/public/statistics");
      const statsData = await statsRes.json();
      setStats(statsData || stats);

      // Fetch recent activity
      const activityRes = await fetch("/api/public/activity");
      const activityData = await activityRes.json();
      setActivities(activityData.activities || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#dc2626";
      case "HIGH":
        return "#ea580c";
      case "MEDIUM":
        return "#eab308";
      case "LOW":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Live Forest Monitor</h1>
          <p className="text-xl text-green-100">
            Real-time deforestation monitoring for Sierra Leone's Northern Region
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Alerts"
            value={stats.totalAlerts}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
          />
          <StatCard
            label="Active Alerts"
            value={stats.activeAlerts || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="orange"
          />
          <StatCard
            label="Area Affected"
            value={`${(stats.totalArea || 0).toFixed(1)} ha`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Regions Monitored"
            value={stats.regionsMonitored || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Alert Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="h-[600px] flex items-center justify-center">
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                ) : (
                  <MapComponent
                    center={[9.5, -12.0]}
                    zoom={9}
                    className="h-[600px] w-full"
                    onMapReady={(map) => {
                      const L = require("leaflet");

                      alerts.forEach((alert) => {
                        const color = getSeverityColor(alert.severity);
                        const marker = L.circleMarker(
                          [alert.latitude, alert.longitude],
                          {
                            radius: 8,
                            fillColor: color,
                            color: "#fff",
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8,
                          }
                        ).addTo(map);

                        marker.bindPopup(`
                          <div>
                            <h3 class="font-bold">${alert.alertCode}</h3>
                            <p><strong>Severity:</strong> ${alert.severity}</p>
                            <p><strong>Region:</strong> ${alert.forestRegion.name}</p>
                            <p><strong>Area:</strong> ${alert.areaHectares.toFixed(2)} ha</p>
                            <p><strong>Date:</strong> ${new Date(alert.detectedDate).toLocaleDateString()}</p>
                          </div>
                        `);
                      });

                      // Fit bounds to show all alerts
                      if (alerts.length > 0) {
                        const bounds = L.latLngBounds(
                          alerts.map((a) => [a.latitude, a.longitude])
                        );
                        map.fitBounds(bounds);
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-600 text-center py-4">Loading...</p>
                ) : activities.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-600"
                      >
                        <p className="text-sm text-gray-700">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regional Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Regional Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts
                    .reduce((acc: any[], alert) => {
                      const region = alert.forestRegion.name;
                      const existing = acc.find((r) => r.name === region);
                      if (existing) {
                        existing.count++;
                        existing.area += alert.areaHectares;
                      } else {
                        acc.push({
                          name: region,
                          district: alert.forestRegion.district,
                          count: 1,
                          area: alert.areaHectares,
                        });
                      }
                      return acc;
                    }, [])
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((region, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{region.name}</p>
                          <p className="text-xs text-gray-600">{region.district}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{region.count}</p>
                          <p className="text-xs text-gray-600">
                            {region.area.toFixed(1)} ha
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Embedded Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Alerts Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600 text-center py-4">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={alerts
                      .reduce((acc: any[], alert) => {
                        const date = new Date(alert.detectedDate).toLocaleDateString();
                        const existing = acc.find((d) => d.date === date);
                        if (existing) {
                          existing.count++;
                        } else {
                          acc.push({ date, count: 1 });
                        }
                        return acc;
                      }, [])
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(-7)}
                  >
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
                      name="Alerts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600 text-center py-4">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        alerts.reduce((acc: any, alert) => {
                          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(
                        alerts.reduce((acc: any, alert) => {
                          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                          return acc;
                        }, {})
                      ).map((_, index) => {
                        const colors = ["#dc2626", "#ea580c", "#eab308", "#22c55e"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Regional Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts by Region</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600 text-center py-4">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={alerts
                      .reduce((acc: any[], alert) => {
                        const region = alert.forestRegion.name;
                        const existing = acc.find((r) => r.region === region);
                        if (existing) {
                          existing.count++;
                        } else {
                          acc.push({ region, count: 1 });
                        }
                        return acc;
                      }, [])
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#22c55e" name="Alerts" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Area Affected by Severity */}
          <Card>
            <CardHeader>
              <CardTitle>Area Affected by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600 text-center py-4">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(
                      alerts.reduce((acc: any, alert) => {
                        acc[alert.severity] = (acc[alert.severity] || 0) + alert.areaHectares;
                        return acc;
                      }, {})
                    ).map(([severity, area]) => ({ severity, area: Number(area).toFixed(1) }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="area" fill="#3b82f6" name="Area (ha)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600 text-center py-4">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No alerts available</p>
            ) : (
              <div className="divide-y">
                {alerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {alert.alertCode}
                          </h3>
                          <Badge
                            variant={
                              alert.severity === "CRITICAL"
                                ? "danger"
                                : alert.severity === "HIGH"
                                ? "warning"
                                : "info"
                            }
                            size="sm"
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            {alert.forestRegion.name} ({alert.forestRegion.district}) •{" "}
                            {alert.areaHectares.toFixed(2)} hectares
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.detectedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
