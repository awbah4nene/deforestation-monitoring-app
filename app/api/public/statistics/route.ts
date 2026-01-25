/**
 * Public Statistics API
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    // For public monitoring, show all alerts (verified or not) but exclude resolved ones
    const [totalAlerts, activeAlerts, totalArea, regionsMonitored] = await Promise.all([
      prisma.deforestationAlert.count({
        where: {
          status: {
            not: "RESOLVED",
          },
        },
      }),
      prisma.deforestationAlert.count({
        where: {
          status: {
            notIn: ["RESOLVED", "FALSE_ALARM"],
          },
        },
      }),
      prisma.deforestationAlert.aggregate({
        where: {
          status: {
            not: "RESOLVED",
          },
        },
        _sum: {
          areaHectares: true,
        },
      }),
      prisma.forestRegion.count(),
    ]);

    return NextResponse.json({
      totalAlerts,
      activeAlerts,
      totalArea: totalArea._sum.areaHectares || 0,
      regionsMonitored,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
