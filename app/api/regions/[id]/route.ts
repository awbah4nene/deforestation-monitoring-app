import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const region = await prisma.forestRegion.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            deforestationAlerts: true,
            fieldReports: true,
            forestPlots: true,
            satelliteImages: true,
            patrolRoutes: true,
            biodiversityRecords: true,
            carbonStocks: true,
          },
        },
        // Recent alerts
        deforestationAlerts: {
          take: 5,
          orderBy: { detectedDate: "desc" },
          select: {
            id: true,
            alertCode: true,
            detectedDate: true,
            severity: true,
            status: true,
            areaHectares: true,
          },
        },
        // Active patrols
        patrolRoutes: {
          where: {
            status: { in: ["PLANNED", "IN_PROGRESS"] },
          },
          take: 5,
          orderBy: { plannedDate: "asc" },
          select: {
            id: true,
            routeName: true,
            plannedDate: true,
            status: true,
            priority: true,
            distance: true,
          },
        },
        // Recent biodiversity records
        biodiversityRecords: {
          take: 5,
          orderBy: { observationDate: "desc" },
          select: {
            id: true,
            speciesName: true,
            scientificName: true,
            speciesType: true,
            observationDate: true,
            count: true,
            isEndangered: true,
          },
        },
        // Latest carbon stock
        carbonStocks: {
          take: 1,
          orderBy: { measurementDate: "desc" },
          select: {
            id: true,
            measurementDate: true,
            carbonDensity: true,
            totalCarbon: true,
            carbonChange: true,
            methodology: true,
          },
        },
      },
    });

    if (!region) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    return NextResponse.json({ region });
  } catch (error) {
    console.error("Error fetching region:", error);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const body = await request.json();

    const region = await prisma.forestRegion.update({
      where: { id: params.id },
      data: body,
      select: {
        id: true,
        name: true,
        regionCode: true,
        district: true,
        chiefdom: true,
        areaHectares: true,
        elevation: true,
        vegetationType: true,
        protectionStatus: true,
        description: true,
        population: true,
      },
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const body = await request.json();

    // Validate required fields
    const { name, regionCode, district, chiefdom, areaHectares } = body;
    if (!name || !regionCode || !district || !chiefdom || areaHectares === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, regionCode, district, chiefdom, areaHectares" },
        { status: 400 }
      );
    }

    const region = await prisma.forestRegion.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        regionCode: regionCode.trim(),
        district: district.trim(),
        chiefdom: chiefdom.trim(),
        areaHectares: parseFloat(areaHectares),
        elevation: body.elevation ? parseFloat(body.elevation) : null,
        vegetationType: body.vegetationType,
        protectionStatus: body.protectionStatus,
        description: body.description?.trim() || null,
        population: body.population ? parseInt(body.population) : null,
      },
      select: {
        id: true,
        name: true,
        regionCode: true,
        district: true,
        chiefdom: true,
        areaHectares: true,
        elevation: true,
        vegetationType: true,
        protectionStatus: true,
        description: true,
        population: true,
      },
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    await prisma.forestRegion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Region deleted successfully" });
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json(
      { error: "Failed to delete region" },
      { status: 500 }
    );
  }
}
