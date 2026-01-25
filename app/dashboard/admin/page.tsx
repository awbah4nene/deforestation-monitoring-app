import { getCurrentUser, requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import AdminCharts from "@/components/dashboard/AdminCharts";

export default async function AdminDashboard() {
  await requireRole([UserRole.ADMIN]);
  const user = await getCurrentUser();

  // Calculate date ranges for trends
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch comprehensive statistics for admin
  const [
    totalAlerts,
    pendingAlerts,
    criticalAlerts,
    regionCount,
    reportCount,
    activeUserCount,
    inactiveUserCount,
    mlModelCount,
    recentUsers,
    recentAlerts,
    alertTrends,
    severityStats,
    statusStats,
    regionStats,
  ] = await Promise.all([
    prisma.deforestationAlert.count(),
    prisma.deforestationAlert.count({ where: { status: "PENDING" } }),
    prisma.deforestationAlert.count({ where: { severity: "CRITICAL" } }),
    prisma.forestRegion.count(),
    prisma.fieldReport.count({
      where: {
        reportDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.mLModel.count({ where: { isActive: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
      },
    }),
    prisma.deforestationAlert.findMany({
      take: 5,
      orderBy: { detectedDate: "desc" },
      include: {
        forestRegion: {
          select: { name: true },
        },
      },
    }),
    // Alert trends (last 30 days) - fetch all and group in code
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
    // Status distribution
    prisma.deforestationAlert.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Regional alerts
    prisma.deforestationAlert.groupBy({
      by: ["forestRegionId"],
      _count: { id: true },
    }),
  ]);

  // Get region names for regional stats
  const regionIds = regionStats.map((r) => r.forestRegionId);
  const regions = await prisma.forestRegion.findMany({
    where: { id: { in: regionIds } },
    select: { id: true, name: true },
  });

  // Format data for charts
  // Group alerts by date
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
    color: COLORS[index % COLORS.length],
  }));

  const formattedStatusData = statusStats.map((item) => ({
    status: item.status.replace(/_/g, " "),
    count: item._count.id,
  }));

  const formattedRegionData = regionStats
    .map((item) => {
      const region = regions.find((r) => r.id === item.forestRegionId);
      return {
        region: region?.name || "Unknown",
        alerts: item._count.id,
      };
    })
    .sort((a, b) => b.alerts - a.alerts)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Complete system overview and management
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Alerts"
          value={totalAlerts}
          icon="🚨"
          color="red"
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          label="Pending Alerts"
          value={pendingAlerts}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          label="Active Users"
          value={activeUserCount}
          icon="👥"
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Forest Regions"
          value={regionCount}
          icon="🌲"
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Critical Alerts"
          value={criticalAlerts}
          icon="⚠️"
          color="red"
        />
        <StatCard
          label="Reports (30d)"
          value={reportCount}
          icon="📝"
          color="blue"
        />
        <StatCard
          label="ML Models"
          value={mlModelCount}
          icon="🤖"
          color="purple"
        />
        <StatCard
          label="Inactive Users"
          value={inactiveUserCount}
          icon="💤"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <AdminCharts
        alertTrends={formattedAlertTrends}
        severityData={formattedSeverityData}
        statusData={formattedStatusData}
        regionData={formattedRegionData}
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
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {alert.forestRegion.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {alert.areaHectares.toFixed(2)} hectares
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
                    <Badge variant="default" size="sm">
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Link
                href="/dashboard/users"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Manage Users
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                      {u.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">
                      {u.role}
                    </Badge>
                    {u.isActive ? (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        Inactive
                      </Badge>
                    )}
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
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-600">
                Add, edit, and deactivate users
              </div>
            </Link>
            <Link
              href="/dashboard/regions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🌲</div>
              <div className="font-medium text-gray-900">Manage Regions</div>
              <div className="text-sm text-gray-600">
                Configure forest regions
              </div>
            </Link>
            <Link
              href="/dashboard/ml-models"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium text-gray-900">ML Models</div>
              <div className="text-sm text-gray-600">
                Monitor and configure AI models
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium text-gray-900">System Settings</div>
              <div className="text-sm text-gray-600">
                Configure system parameters
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
