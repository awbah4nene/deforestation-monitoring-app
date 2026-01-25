/**
 * Public Activity Feed API
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get recent public activities
    const activities = [];

    // Recent alerts (show all active alerts, not just verified)
    const recentAlerts = await prisma.deforestationAlert.findMany({
      where: {
        status: {
          notIn: ["RESOLVED", "FALSE_ALARM"],
        },
      },
      select: {
        id: true,
        alertCode: true,
        severity: true,
        detectedDate: true,
        forestRegion: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        detectedDate: "desc",
      },
      take: 5,
    });

    recentAlerts.forEach((alert) => {
      activities.push({
        id: `alert-${alert.id}`,
        type: "ALERT",
        description: `New ${alert.severity} alert detected in ${alert.forestRegion.name}: ${alert.alertCode}`,
        timestamp: alert.detectedDate,
      });
    });

    // Recent reports (show all reports, not just verified)
    const recentReports = await prisma.fieldReport.findMany({
      where: {},
      select: {
        id: true,
        reportCode: true,
        reportDate: true,
        forestRegion: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        reportDate: "desc",
      },
      take: 5,
    });

    recentReports.forEach((report) => {
      activities.push({
        id: `report-${report.id}`,
        type: "REPORT",
        description: `Field report verified: ${report.reportCode} in ${report.forestRegion.name}`,
        timestamp: report.reportDate,
      });
    });

    // Sort by timestamp and limit
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
