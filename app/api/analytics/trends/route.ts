/**
 * Deforestation Trends Analytics API
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
    const groupBy = searchParams.get("groupBy") || "month"; // day, week, month, year

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get alerts grouped by time period
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        detectedDate: true,
        severity: true,
        areaHectares: true,
        forestRegionId: true,
      },
    });

    // Group by time period
    const grouped: Record<string, {
      date: string;
      count: number;
      totalArea: number;
      bySeverity: Record<string, number>;
    }> = {};

    alerts.forEach((alert) => {
      let key: string;
      const date = new Date(alert.detectedDate);

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          key = String(date.getFullYear());
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          count: 0,
          totalArea: 0,
          bySeverity: {},
        };
      }

      grouped[key].count++;
      grouped[key].totalArea += alert.areaHectares || 0;
      grouped[key].bySeverity[alert.severity] = (grouped[key].bySeverity[alert.severity] || 0) + 1;
    });

    // Convert to array and sort
    const trends = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
