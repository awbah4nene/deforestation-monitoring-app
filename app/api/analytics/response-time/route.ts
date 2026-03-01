/**
 * Response Time Metrics API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get alerts with status changes (use updatedAt; statusUpdatedAt does not exist on schema)
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: start,
          lte: end,
        },
        status: {
          not: "PENDING",
        },
      },
      select: {
        id: true,
        detectedDate: true,
        status: true,
        updatedAt: true,
        severity: true,
        forestRegionId: true,
      },
    });

    // Calculate response times (detectedDate -> updatedAt = time to first update)
    const responseTimes: number[] = [];
    const bySeverity: Record<string, number[]> = {};
    const byRegion: Record<string, number[]> = {};

    alerts.forEach((alert) => {
      if (alert.updatedAt) {
        const detected = new Date(alert.detectedDate).getTime();
        const updated = new Date(alert.updatedAt).getTime();
        const responseTime = (updated - detected) / (1000 * 60 * 60); // Hours

        responseTimes.push(responseTime);

        // Group by severity
        if (!bySeverity[alert.severity]) {
          bySeverity[alert.severity] = [];
        }
        bySeverity[alert.severity].push(responseTime);

        // Group by region
        if (!byRegion[alert.forestRegionId]) {
          byRegion[alert.forestRegionId] = [];
        }
        byRegion[alert.forestRegionId].push(responseTime);
      }
    });

    // Calculate statistics
    const calculateStats = (times: number[]) => {
      if (times.length === 0) {
        return {
          average: 0,
          median: 0,
          min: 0,
          max: 0,
          p95: 0,
        };
      }

      const sorted = [...times].sort((a, b) => a - b);
      const sum = times.reduce((a, b) => a + b, 0);
      const average = sum / times.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];

      return { average, median, min, max, p95 };
    };

    const overall = calculateStats(responseTimes);
    const bySeverityStats: Record<string, any> = {};
    const byRegionStats: Record<string, any> = {};

    Object.keys(bySeverity).forEach((severity) => {
      bySeverityStats[severity] = calculateStats(bySeverity[severity]);
    });

    Object.keys(byRegion).forEach((regionId) => {
      byRegionStats[regionId] = calculateStats(byRegion[regionId]);
    });

    return NextResponse.json({
      overall,
      bySeverity: bySeverityStats,
      byRegion: byRegionStats,
      totalAlerts: alerts.length,
      respondedAlerts: responseTimes.length,
    });
  } catch (error) {
    console.error("Error fetching response time metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch response time metrics" },
      { status: 500 }
    );
  }
}
