import { getCurrentUser, requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import ViewerCharts from "@/components/dashboard/ViewerCharts";

export default async function ViewerDashboard() {
  await requireRole([UserRole.VIEWER]);

  // Calculate date ranges
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch basic read-only statistics
  const [
    totalAlerts,
    regionCount,
    totalArea,
    recentAlerts,
    alertTrends,
    severityStats,
    regionStats,
  ] = await Promise.all([
    prisma.deforestationAlert.count(),
    prisma.forestRegion.count(),
    prisma.forestRegion.aggregate({
      _sum: { areaHectares: true },
    }),
    prisma.deforestationAlert.findMany({
      take: 6,
      orderBy: { detectedDate: "desc" },
      include: {
        forestRegion: {
          select: { name: true, district: true },
        },
      },
    }),
    // Alert trends (last 30 days)
    prisma.deforestationAlert.findMany({
      where: {
        detectedDate: { gte: thirtyDaysAgo },
      },
      select: { detectedDate: true },
      orderBy: { detectedDate: "asc" },
    }),
    // Severity distribution
    prisma.deforestationAlert.groupBy({
      by: ["severity"],
      _count: { id: true },
    }),
    // Regional alerts
    prisma.deforestationAlert.groupBy({
      by: ["forestRegionId"],
      _count: { id: true },
    }),
  ]);

  // Get region names
  const regionIds = regionStats.map((r) => r.forestRegionId);
  const regionsForStats = await prisma.forestRegion.findMany({
    where: { id: { in: regionIds } },
    select: { id: true, name: true },
  });

  // Format data for charts
  const alertsByDate = new Map<string, number>();
  alertTrends.forEach((alert) => {
    const dateKey = new Date(alert.detectedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    alertsByDate.set(dateKey, (alertsByDate.get(dateKey) || 0) + 1);
  });
  const formattedAlertTrends = Array.from(alertsByDate.entries()).map(
    ([date, count]) => ({ date, count })
  );

  const formattedSeverityData = severityStats.map((item, index) => ({
    name: item.severity,
    value: item._count.id,
    color: ["#dc2626", "#ea580c", "#eab308", "#22c55e"][index % 4],
  }));

  const formattedRegionData = regionStats
    .map((item) => {
      const region = regionsForStats.find((r) => r.id === item.forestRegionId);
      return {
        name: region?.name || "Unknown",
        alerts: item._count.id,
      };
    })
    .sort((a, b) => b.alerts - a.alerts)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Viewer Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Northern Region forest monitoring overview (Read-only access)
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Alerts"
          value={totalAlerts}
          icon="🚨"
          color="red"
        />
        <StatCard
          label="Forest Regions"
          value={regionCount}
          icon="🌲"
          color="green"
        />
        <StatCard
          label="Protected Area"
          value={`${(totalArea._sum.areaHectares || 0).toFixed(0)} ha`}
          icon="🌍"
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <ViewerCharts
        alertTrends={formattedAlertTrends}
        severityData={formattedSeverityData}
        regionData={formattedRegionData}
      />

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Deforestation Alerts</CardTitle>
            <Link
              href="/dashboard/alerts"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/dashboard/alerts/${alert.id}`}
                className="block"
              >
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {alert.forestRegion.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {alert.forestRegion.district}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{alert.areaHectares.toFixed(2)} hectares</span>
                    <span>
                      {new Date(alert.detectedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/map"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-medium text-gray-900">View Map</div>
              <div className="text-sm text-gray-600">
                Browse forest regions and alerts on interactive map
              </div>
            </Link>
            <Link
              href="/dashboard/alerts"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium text-gray-900">Browse Alerts</div>
              <div className="text-sm text-gray-600">
                View all deforestation alerts and details
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Info Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Viewer Access Level
              </h3>
              <p className="text-sm text-gray-600">
                You have read-only access to view monitoring data and alerts.
                You cannot make changes or perform administrative actions. For
                more access or inquiries, please contact system administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
