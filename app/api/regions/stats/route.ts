import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const [
      totalRegions,
      totalArea,
      alertCount,
      reportCount,
      districtStats,
      protectionStats,
    ] = await Promise.all([
      prisma.forestRegion.count(),
      prisma.forestRegion.aggregate({
        _sum: { areaHectares: true },
      }),
      prisma.deforestationAlert.count(),
      prisma.fieldReport.count(),
      prisma.forestRegion.groupBy({
        by: ["district"],
        _count: { _all: true },
        _sum: { areaHectares: true },
      }),
      prisma.forestRegion.groupBy({
        by: ["protectionStatus"],
        _count: { _all: true },
        _sum: { areaHectares: true },
      }),
    ]);

    return NextResponse.json({
      totalRegions,
      totalArea: totalArea._sum.areaHectares || 0,
      alertCount,
      reportCount,
      districtStats,
      protectionStats,
    });
  } catch (error) {
    console.error("Error fetching region stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
