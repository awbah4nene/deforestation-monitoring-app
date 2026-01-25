import { getCurrentUser, requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import FieldOfficerCharts from "@/components/dashboard/FieldOfficerCharts";

export default async function FieldOfficerDashboard() {
  await requireRole([UserRole.FIELD_OFFICER]);
  const user = await getCurrentUser();

  // Calculate date ranges
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch statistics for field officer
  const [
    assignedAlerts,
    myReports,
    pendingAlerts,
    verifiedToday,
    myAlerts,
    recentReports,
    myReportsTrend,
    myAlertsForCharts,
    regionPerformanceData,
  ] = await Promise.all([
    prisma.deforestationAlert.count({
      where: { assignedToId: user?.id },
    }),
    prisma.fieldReport.count({
      where: { userId: user?.id },
    }),
    prisma.deforestationAlert.count({
      where: {
        assignedToId: user?.id,
        status: "PENDING",
      },
    }),
    prisma.deforestationAlert.count({
      where: {
        assignedToId: user?.id,
        status: "VERIFIED",
        verifiedDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.deforestationAlert.findMany({
      where: { assignedToId: user?.id },
      take: 6,
      orderBy: { detectedDate: "desc" },
      include: {
        forestRegion: {
          select: { name: true, district: true },
        },
      },
    }),
    prisma.fieldReport.findMany({
      where: { userId: user?.id },
      take: 5,
      orderBy: { reportDate: "desc" },
      include: {
        forestRegion: {
          select: { name: true },
        },
      },
    }),
    // My reports trend (last 30 days)
    prisma.fieldReport.findMany({
      where: {
        userId: user?.id,
        reportDate: { gte: thirtyDaysAgo },
      },
      select: { reportDate: true },
      orderBy: { reportDate: "asc" },
    }),
    // All my alerts for charts
    prisma.deforestationAlert.findMany({
      where: { assignedToId: user?.id },
      select: {
        severity: true,
        status: true,
        forestRegion: { select: { name: true } },
      },
    }),
    // Region performance
    prisma.deforestationAlert.groupBy({
      by: ["forestRegionId"],
      where: { assignedToId: user?.id },
      _count: { id: true },
    }),
  ]);

  // Get region names for performance
  const regionIds = regionPerformanceData.map((r) => r.forestRegionId);
  const regionsForPerformance = await prisma.forestRegion.findMany({
    where: { id: { in: regionIds } },
    select: { id: true, name: true },
  });

  // Format data for charts
  const reportsByDate = new Map<string, number>();
  myReportsTrend.forEach((report) => {
    const dateKey = new Date(report.reportDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    reportsByDate.set(dateKey, (reportsByDate.get(dateKey) || 0) + 1);
  });
  const formattedReportTrends = Array.from(reportsByDate.entries()).map(
    ([date, count]) => ({ date, count })
  );

  // Alert status distribution
  const statusCounts = myAlertsForCharts.reduce((acc, alert) => {
    acc[alert.status] = (acc[alert.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const formattedAlertStatus = Object.entries(statusCounts).map(
    ([status, count]) => ({
      status: status.replace(/_/g, " "),
      count,
    })
  );

  // Region performance
  const regionPerfMap = new Map<string, { verified: number; pending: number }>();
  myAlertsForCharts.forEach((alert) => {
    const regionName = alert.forestRegion.name;
    if (!regionPerfMap.has(regionName)) {
      regionPerfMap.set(regionName, { verified: 0, pending: 0 });
    }
    const perf = regionPerfMap.get(regionName)!;
    if (alert.status === "VERIFIED" || alert.status === "RESOLVED") {
      perf.verified++;
    } else {
      perf.pending++;
    }
  });
  const formattedRegionPerformance = Array.from(regionPerfMap.entries()).map(
    ([region, data]) => ({
      region,
      ...data,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Field Officer Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Your assigned alerts and field activities
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Assigned Alerts"
          value={assignedAlerts}
          icon="📋"
          color="blue"
        />
        <StatCard
          label="Pending Action"
          value={pendingAlerts}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          label="My Reports"
          value={myReports}
          icon="📝"
          color="green"
        />
        <StatCard
          label="Verified Today"
          value={verifiedToday}
          icon="✅"
          color="green"
        />
      </div>

      {/* Charts Section */}
      <FieldOfficerCharts
        reportTrends={formattedReportTrends}
        alertStatus={formattedAlertStatus}
        regionPerformance={formattedRegionPerformance}
        myAlerts={myAlertsForCharts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assigned Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Assigned Alerts</CardTitle>
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
              {myAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No alerts assigned yet
                </p>
              ) : (
                myAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={`/dashboard/alerts/${alert.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {alert.alertCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          {alert.forestRegion.name} - {alert.forestRegion.district}
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
                        <Badge
                          variant={
                            alert.status === "PENDING"
                              ? "warning"
                              : alert.status === "VERIFIED"
                              ? "success"
                              : "info"
                          }
                          size="sm"
                        >
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Recent Reports</CardTitle>
              <Link
                href="/dashboard/reports"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No reports submitted yet
                </p>
              ) : (
                recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{report.title}</p>
                      <Badge
                        variant={report.isVerified ? "success" : "warning"}
                        size="sm"
                      >
                        {report.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {report.forestRegion.name} -{" "}
                      {new Date(report.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Field Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/alerts"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium text-gray-900">My Alerts</div>
              <div className="text-sm text-gray-600">
                View and verify assigned alerts
              </div>
            </Link>
            <Link
              href="/dashboard/reports/new"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-gray-900">New Report</div>
              <div className="text-sm text-gray-600">
                Submit field observation
              </div>
            </Link>
            <Link
              href="/dashboard/map"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-medium text-gray-900">Map View</div>
              <div className="text-sm text-gray-600">
                View alerts on map
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
