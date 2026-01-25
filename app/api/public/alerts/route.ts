/**
 * Public Alerts API (Read-only)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get active alerts for public view (exclude resolved and false alarms)
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        status: {
          notIn: ["RESOLVED", "FALSE_ALARM"],
        },
      },
      select: {
        id: true,
        alertCode: true,
        severity: true,
        latitude: true,
        longitude: true,
        areaHectares: true,
        detectedDate: true,
        forestRegion: {
          select: {
            name: true,
            district: true,
          },
        },
      },
      orderBy: {
        detectedDate: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching public alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
