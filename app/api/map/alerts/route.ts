import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const regionId = searchParams.get("regionId");
    const district = searchParams.get("district");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (severity && severity !== "ALL") where.severity = severity;
    if (regionId) where.forestRegionId = regionId;
    if (district && district !== "ALL") {
      where.forestRegion = { district };
    }
    if (startDate || endDate) {
      where.alertDate = {};
      if (startDate) where.alertDate.gte = new Date(startDate);
      if (endDate) where.alertDate.lte = new Date(endDate);
    }

    // Fetch deforestation alerts with location data
    const alerts = await prisma.deforestationAlert.findMany({
      where,
      select: {
        id: true,
        alertCode: true,
        latitude: true,
        longitude: true,
        geometry: true,
        alertDate: true,
        detectedDate: true,
        areaHectares: true,
        confidence: true,
        severity: true,
        status: true,
        priority: true,
        ndviChange: true,
        forestRegionId: true,
        assignedToId: true,
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
            chiefdom: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            fieldReports: true,
            alertComments: true,
          },
        },
      },
      orderBy: [
        { severity: "desc" },
        { detectedDate: "desc" },
      ],
      take: 500,
    });

    // Get summary stats
    const stats = await prisma.deforestationAlert.groupBy({
      by: ["severity"],
      _count: { id: true },
      where,
    });

    const statusStats = await prisma.deforestationAlert.groupBy({
      by: ["status"],
      _count: { id: true },
      where,
    });

    return NextResponse.json({ 
      alerts,
      stats: {
        bySeverity: stats,
        byStatus: statusStats,
        total: alerts.length,
      }
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
