import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const protectionStatus = searchParams.get("protectionStatus");
    const vegetationType = searchParams.get("vegetationType");
    const search = searchParams.get("search");

    const where: any = {};
    if (district) where.district = district;
    if (protectionStatus) where.protectionStatus = protectionStatus;
    if (vegetationType) where.vegetationType = vegetationType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { regionCode: { contains: search, mode: "insensitive" } },
        { chiefdom: { contains: search, mode: "insensitive" } },
      ];
    }

    const regions = await prisma.forestRegion.findMany({
      where,
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
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            deforestationAlerts: true,
            fieldReports: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const region = await prisma.forestRegion.create({
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
      },
    });

    return NextResponse.json({ region }, { status: 201 });
  } catch (error) {
    console.error("Error creating region:", error);
    return NextResponse.json(
      { error: "Failed to create region" },
      { status: 500 }
    );
  }
}
