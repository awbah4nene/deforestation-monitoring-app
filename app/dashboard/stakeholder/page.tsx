import { getCurrentUser, requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import StakeholderCharts from "@/components/dashboard/StakeholderCharts";

export default async function StakeholderDashboard() {
  await requireRole([UserRole.STAKEHOLDER]);
  const user = await getCurrentUser();

  // Calculate date ranges
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch read-only statistics for stakeholders
  const [
    totalAlerts,
    activeAlerts,
    regionCount,
    totalArea,
    recentAlerts,
    regionSummary,
    alertTrends,
    severityStats,
    districtAlerts,
  ] = await Promise.all([
    prisma.deforestationAlert.count(),
    prisma.deforestationAlert.count({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    }),
    prisma.forestRegion.count(),
    prisma.forestRegion.aggregate({
      _sum: { areaHectares: true },
    }),
    prisma.deforestationAlert.findMany({
      take: 8,
      orderBy: { detectedDate: "desc" },
      include: {
        forestRegion: {
          select: { name: true, district: true },
        },
      },
    }),
    prisma.forestRegion.groupBy({
      by: ["district"],
      _count: {
        _all: true,
      },
      _sum: {
        areaHectares: true,
      },
    }),
    // Alert trends (last 30 days)
    prisma.deforestationAlert.findMany({
      where: {
        detectedDate: { gte: thirtyDaysAgo },
      },
      select: { detectedDate: true, forestRegion: { select: { district: true } } },
      orderBy: { detectedDate: "asc" },
    }),
    // Severity distribution
    prisma.deforestationAlert.groupBy({
      by: ["severity"],
      _count: { id: true },
    }),
    // District alerts
    prisma.deforestationAlert.groupBy({
      by: ["forestRegionId"],
      _count: { id: true },
    }),
  ]);

  // Get district names for district alerts
  const districtRegionIds = districtAlerts.map((d) => d.forestRegionId);
  const districtsForAlerts = await prisma.forestRegion.findMany({
    where: { id: { in: districtRegionIds } },
    select: { id: true, district: true },
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

  // Group by district
  const districtMap = new Map<string, number>();
  alertTrends.forEach((alert) => {
    const district = alert.forestRegion.district;
    districtMap.set(district, (districtMap.get(district) || 0) + 1);
  });
  const formattedDistrictData = Array.from(districtMap.entries())
    .map(([district, alerts]) => ({
      district,
      alerts,
    }))
    .sort((a, b) => b.alerts - a.alerts);

  const formattedSeverityData = severityStats.map((item, index) => ({
    name: item.severity,
    value: item._count.id,
    color: ["#dc2626", "#ea580c", "#eab308", "#22c55e"][index % 4],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Stakeholder Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Northern Region forest monitoring insights and analytics
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Alerts"
          value={totalAlerts}
          icon="🚨"
          color="red"
        />
        <StatCard
          label="Active Alerts"
          value={activeAlerts}
          icon="⏳"
          color="yellow"
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
      <StakeholderCharts
        alertTrends={formattedAlertTrends}
        districtData={formattedDistrictData}
        severityData={formattedSeverityData}
        regionSummary={regionSummary}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={`/dashboard/alerts/${alert.id}`}
                  className="block"
                >
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">
                        {alert.forestRegion.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {alert.forestRegion.district} - {alert.areaHectares.toFixed(2)} ha
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.detectedDate).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* District Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage by District</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionSummary.map((district) => (
                <div
                  key={district.district}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {district.district}
                      </p>
                      <p className="text-sm text-gray-600">
                        {district._count._all} regions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {(district._sum.areaHectares || 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">hectares</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/map"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-medium text-gray-900">Interactive Map</div>
              <div className="text-sm text-gray-600">
                View forest regions and alerts
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-sm text-gray-600">
                View trends and insights
              </div>
            </Link>
            <Link
              href="/dashboard/regions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🌲</div>
              <div className="font-medium text-gray-900">Forest Regions</div>
              <div className="text-sm text-gray-600">
                Browse protected areas
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
                Stakeholder Access
              </h3>
              <p className="text-sm text-gray-600">
                As a stakeholder, you have read-only access to monitoring data
                and analytics. For inquiries or collaboration opportunities,
                please contact the system administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
