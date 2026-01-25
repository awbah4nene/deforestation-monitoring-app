import { getCurrentUser, requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import GovernmentCharts from "@/components/dashboard/GovernmentCharts";

export default async function GovernmentDashboard() {
  await requireRole([UserRole.GOVERNMENT_OFFICIAL]);
  const user = await getCurrentUser();

  // Calculate date ranges for trends
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch statistics for government officials
  const [
    totalAlerts,
    criticalAlerts,
    pendingAlerts,
    regionCount,
    reportCount,
    recentAlerts,
    regionStats,
    alertTrends,
    districtStats,
    statusStats,
  ] = await Promise.all([
    prisma.deforestationAlert.count(),
    prisma.deforestationAlert.count({ where: { severity: "CRITICAL" } }),
    prisma.deforestationAlert.count({ where: { status: "PENDING" } }),
    prisma.forestRegion.count(),
    prisma.fieldReport.count({
      where: {
        reportDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
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
    prisma.forestRegion.findMany({
      select: {
        name: true,
        district: true,
        areaHectares: true,
        _count: {
          select: {
            deforestationAlerts: true,
          },
        },
      },
      take: 5,
      orderBy: {
        deforestationAlerts: {
          _count: "desc",
        },
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
    // District statistics
    prisma.deforestationAlert.groupBy({
      by: ["forestRegionId"],
      where: {
        detectedDate: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    }),
    // Status distribution
    prisma.deforestationAlert.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Get district names for district stats
  const regionIds = districtStats.map((d) => d.forestRegionId);
  const regionsForDistricts = await prisma.forestRegion.findMany({
    where: { id: { in: regionIds } },
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
      area: 0, // Can be enhanced later
    }))
    .sort((a, b) => b.alerts - a.alerts);

  const formattedComplianceData = statusStats.map((item) => ({
    status: item.status.replace(/_/g, " "),
    count: item._count.id,
  }));

  const formattedRegionStats = regionStats.map((r) => ({
    name: r.name,
    district: r.district,
    alerts: r._count.deforestationAlerts,
    area: r.areaHectares,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Government Official Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Northern Region forest monitoring overview and policy management
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
          label="Critical Alerts"
          value={criticalAlerts}
          icon="⚠️"
          color="red"
        />
        <StatCard
          label="Pending Review"
          value={pendingAlerts}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          label="Forest Regions"
          value={regionCount}
          icon="🌲"
          color="green"
        />
      </div>

      {/* Charts Section */}
      <GovernmentCharts
        alertTrends={formattedAlertTrends}
        districtData={formattedDistrictData}
        complianceData={formattedComplianceData}
        regionStats={formattedRegionStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {alert.forestRegion.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alert.forestRegion.district} - {alert.areaHectares.toFixed(2)} ha
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Risk Regions */}
        <Card>
          <CardHeader>
            <CardTitle>High Risk Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionStats.map((region) => (
                <div
                  key={region.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{region.name}</p>
                    <p className="text-sm text-gray-600">
                      {region.district} - {region.areaHectares.toFixed(0)} ha
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {region._count.deforestationAlerts}
                    </p>
                    <p className="text-xs text-gray-500">alerts</p>
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
          <CardTitle>Policy & Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/alerts"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium text-gray-900">Review Alerts</div>
              <div className="text-sm text-gray-600">
                Assess deforestation alerts
              </div>
            </Link>
            <Link
              href="/dashboard/regions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🌲</div>
              <div className="font-medium text-gray-900">Forest Regions</div>
              <div className="text-sm text-gray-600">
                Monitor protected areas
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-sm text-gray-600">
                View trends and reports
              </div>
            </Link>
            <Link
              href="/dashboard/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-600">
                Field officers and staff
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
