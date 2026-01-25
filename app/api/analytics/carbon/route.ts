/**
 * Carbon Loss Calculations API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

// Average carbon stock per hectare in tropical forests (tons CO2e)
const AVERAGE_CARBON_STOCK = 200; // tons CO2e per hectare

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

    // Get alerts with area data
    const alerts = await prisma.deforestationAlert.findMany({
      where,
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
      select: {
        id: true,
        areaHectares: true,
        detectedDate: true,
        severity: true,
        forestRegionId: true,
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
    });

    // Calculate carbon loss
    let totalAreaLost = 0;
    let totalCarbonLost = 0;
    const byRegion: Record<string, {
      regionId: string;
      regionName: string;
      district: string;
      areaLost: number;
      carbonLost: number;
    }> = {};

    const byMonth: Record<string, {
      month: string;
      areaLost: number;
      carbonLost: number;
    }> = {};

    alerts.forEach((alert) => {
      const area = alert.areaHectares || 0;
      const carbon = area * AVERAGE_CARBON_STOCK;

      totalAreaLost += area;
      totalCarbonLost += carbon;

      // By region
      const regionId = alert.forestRegionId;
      if (!byRegion[regionId]) {
        byRegion[regionId] = {
          regionId,
          regionName: alert.forestRegion.name,
          district: alert.forestRegion.district,
          areaLost: 0,
          carbonLost: 0,
        };
      }
      byRegion[regionId].areaLost += area;
      byRegion[regionId].carbonLost += carbon;

      // By month
      const date = new Date(alert.detectedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          areaLost: 0,
          carbonLost: 0,
        };
      }
      byMonth[monthKey].areaLost += area;
      byMonth[monthKey].carbonLost += carbon;
    });

    // Convert to arrays
    const byRegionArray = Object.values(byRegion).sort(
      (a, b) => b.carbonLost - a.carbonLost
    );

    const byMonthArray = Object.values(byMonth).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Calculate equivalent emissions (for context)
    const equivalentEmissions = {
      carsPerYear: totalCarbonLost * 4.6, // Average car emits 4.6 tons CO2/year
      homesPerYear: totalCarbonLost / 20, // Average home emits 20 tons CO2/year
      flights: totalCarbonLost * 0.5, // Rough estimate
    };

    return NextResponse.json({
      total: {
        areaLost: totalAreaLost,
        carbonLost: totalCarbonLost,
        equivalentEmissions,
      },
      byRegion: byRegionArray,
      byMonth: byMonthArray,
      averageCarbonStock: AVERAGE_CARBON_STOCK,
    });
  } catch (error) {
    console.error("Error calculating carbon loss:", error);
    return NextResponse.json(
      { error: "Failed to calculate carbon loss" },
      { status: 500 }
    );
  }
}
