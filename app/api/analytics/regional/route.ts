/**
 * Regional Comparisons Analytics API
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

    // Get alerts by region
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
            chiefdom: true,
          },
        },
      },
    });

    // Group by region
    const regionalData: Record<string, {
      regionId: string;
      regionName: string;
      district: string;
      chiefdom: string;
      alertCount: number;
      totalArea: number;
      bySeverity: Record<string, number>;
      averageArea: number;
    }> = {};

    alerts.forEach((alert) => {
      const regionId = alert.forestRegionId;
      const region = alert.forestRegion;

      if (!regionalData[regionId]) {
        regionalData[regionId] = {
          regionId,
          regionName: region.name,
          district: region.district,
          chiefdom: region.chiefdom,
          alertCount: 0,
          totalArea: 0,
          bySeverity: {},
          averageArea: 0,
        };
      }

      regionalData[regionId].alertCount++;
      regionalData[regionId].totalArea += alert.areaHectares || 0;
      regionalData[regionId].bySeverity[alert.severity] = 
        (regionalData[regionId].bySeverity[alert.severity] || 0) + 1;
    });

    // Calculate averages
    Object.values(regionalData).forEach((data) => {
      data.averageArea = data.alertCount > 0 ? data.totalArea / data.alertCount : 0;
    });

    // Convert to array and sort by alert count
    const comparisons = Object.values(regionalData).sort(
      (a, b) => b.alertCount - a.alertCount
    );

    return NextResponse.json({ comparisons });
  } catch (error) {
    console.error("Error fetching regional comparisons:", error);
    return NextResponse.json(
      { error: "Failed to fetch regional comparisons" },
      { status: 500 }
    );
  }
}
