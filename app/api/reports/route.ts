/**
 * Field Reports API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const regionId = searchParams.get("regionId");
    const reportType = searchParams.get("reportType");
    const isVerified = searchParams.get("isVerified");
    const search = searchParams.get("search");

    const where: any = {};
    
    // Role-based filtering
    if (user.role === "FIELD_OFFICER") {
      where.userId = user.id; // Field officers only see their own reports
    }
    
    if (regionId) where.forestRegionId = regionId;
    if (reportType) where.reportType = reportType;
    if (isVerified !== null) where.isVerified = isVerified === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { reportCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.fieldReport.findMany({
        where,
        include: {
          forestRegion: {
            select: {
              id: true,
              name: true,
              district: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              evidenceCollections: true,
            },
          },
        },
        orderBy: { reportDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fieldReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      forestRegionId,
      reportType,
      title,
      description,
      reportDate,
      visitDate,
      latitude,
      longitude,
      geometry,
      accuracy,
      deforestationObserved,
      estimatedAreaLoss,
      cause,
      evidencePhotos,
      notes,
      weather,
      temperature,
    } = body;

    // Validate required fields
    if (!forestRegionId || forestRegionId.trim() === "") {
      return NextResponse.json(
        { error: "Forest region is required" },
        { status: 400 }
      );
    }

    if (!reportType) {
      return NextResponse.json(
        { error: "Report type is required" },
        { status: 400 }
      );
    }

    // Validate reportType enum
    const validReportTypes = [
      "ALERT_VERIFICATION",
      "ROUTINE_MONITORING",
      "INCIDENT_REPORT",
      "BIODIVERSITY_SURVEY",
      "ENFORCEMENT_ACTION",
      "RESTORATION_PROGRESS",
    ];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify forest region exists
    const region = await prisma.forestRegion.findUnique({
      where: { id: forestRegionId },
    });
    if (!region) {
      return NextResponse.json(
        { error: "Forest region not found" },
        { status: 404 }
      );
    }

    // Generate report code
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const count = await prisma.fieldReport.count({
      where: {
        reportDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
    const reportCode = `FR-${year}${month}${day}-${String(count + 1).padStart(4, "0")}`;

    const report = await prisma.fieldReport.create({
      data: {
        reportCode,
        forestRegionId: forestRegionId.trim(),
        userId: user.id,
        reportType: reportType as any, // Type assertion for enum
        title: title.trim(),
        description: description?.trim() || "",
        reportDate: reportDate ? new Date(reportDate) : new Date(),
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        latitude: typeof latitude === "number" ? latitude : parseFloat(latitude) || 0,
        longitude: typeof longitude === "number" ? longitude : parseFloat(longitude) || 0,
        geometry: geometry || null,
        accuracy: accuracy ? (typeof accuracy === "number" ? accuracy : parseFloat(accuracy)) : null,
        deforestationObserved: deforestationObserved || false,
        estimatedAreaLoss: estimatedAreaLoss ? (typeof estimatedAreaLoss === "number" ? estimatedAreaLoss : parseFloat(estimatedAreaLoss)) : null,
        cause: cause && cause.trim() !== "" ? (cause as any) : null, // Type assertion for enum
        evidencePhotos: Array.isArray(evidencePhotos) ? evidencePhotos : [],
        notes: notes?.trim() || null,
        weather: weather?.trim() || null,
        temperature: temperature ? (typeof temperature === "number" ? temperature : parseFloat(temperature)) : null,
        isVerified: false,
      },
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
