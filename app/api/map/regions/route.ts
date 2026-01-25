import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const protectionStatus = searchParams.get("protectionStatus");

    // Build where clause
    const where: any = {};
    if (district && district !== "ALL") where.district = district;
    if (protectionStatus && protectionStatus !== "ALL") where.protectionStatus = protectionStatus;

    // Fetch forest regions with their geometries and alert counts
    const regions = await prisma.forestRegion.findMany({
      where,
      select: {
        id: true,
        name: true,
        regionCode: true,
        district: true,
        chiefdom: true,
        areaHectares: true,
        geometry: true,
        centroid: true,
        elevation: true,
        vegetationType: true,
        protectionStatus: true,
        description: true,
        population: true,
        _count: {
          select: {
            deforestationAlerts: true,
            fieldReports: true,
            patrolRoutes: true,
          },
        },
        deforestationAlerts: {
          where: { status: "PENDING" },
          select: { id: true, severity: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get distinct districts for filter
    const districts = await prisma.forestRegion.findMany({
      distinct: ["district"],
      select: { district: true },
      orderBy: { district: "asc" },
    });

    // Calculate totals
    const totalArea = regions.reduce((sum, r) => sum + r.areaHectares, 0);
    const totalAlerts = regions.reduce((sum, r) => sum + r._count.deforestationAlerts, 0);

    return NextResponse.json({ 
      regions,
      districts: districts.map(d => d.district),
      stats: {
        totalRegions: regions.length,
        totalArea,
        totalAlerts,
      }
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 }
    );
  }
}
