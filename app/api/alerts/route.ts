import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const regionId = searchParams.get("regionId");
    const district = searchParams.get("district");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (regionId) where.forestRegionId = regionId;
    if (district) where.forestRegion = { district };
    if (search) {
      where.OR = [
        { alertCode: { contains: search, mode: "insensitive" } },
        { forestRegion: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Fetch alerts with pagination
    const [alerts, total] = await Promise.all([
      prisma.deforestationAlert.findMany({
        where,
        include: {
          forestRegion: {
            select: {
              name: true,
              district: true,
              chiefdom: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              alertComments: true,
              fieldReports: true,
            },
          },
        },
        orderBy: {
          detectedDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.deforestationAlert.count({ where }),
    ]);

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const alert = await prisma.deforestationAlert.create({
      data: {
        ...body,
        assignedToId: body.assignedToId || user.id,
      },
      include: {
        forestRegion: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
