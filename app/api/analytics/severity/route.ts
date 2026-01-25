/**
 * Severity Distribution Analytics API
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
    const regionId = searchParams.get("regionId");

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const where: any = {
      detectedDate: {
        gte: start,
        lte: end,
      },
    };

    if (regionId) {
      where.forestRegionId = regionId;
    }

    // Get alerts grouped by severity
    const alerts = await prisma.deforestationAlert.findMany({
      where,
      select: {
        severity: true,
        areaHectares: true,
      },
    });

    // Group by severity
    const distribution: Record<string, {
      severity: string;
      count: number;
      totalArea: number;
      percentage: number;
    }> = {};

    const totalAlerts = alerts.length;
    let totalArea = 0;

    alerts.forEach((alert) => {
      if (!distribution[alert.severity]) {
        distribution[alert.severity] = {
          severity: alert.severity,
          count: 0,
          totalArea: 0,
          percentage: 0,
        };
      }

      distribution[alert.severity].count++;
      distribution[alert.severity].totalArea += alert.areaHectares || 0;
      totalArea += alert.areaHectares || 0;
    });

    // Calculate percentages
    Object.values(distribution).forEach((data) => {
      data.percentage = totalAlerts > 0 ? (data.count / totalAlerts) * 100 : 0;
    });

    // Convert to array
    const severityDistribution = Object.values(distribution).sort((a, b) => {
      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (order[b.severity as keyof typeof order] || 0) - (order[a.severity as keyof typeof order] || 0);
    });

    return NextResponse.json({
      distribution: severityDistribution,
      total: totalAlerts,
      totalArea,
    });
  } catch (error) {
    console.error("Error fetching severity distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch severity distribution" },
      { status: 500 }
    );
  }
}
