/**
 * Field Report Detail API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db/connect";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const report = await prisma.fieldReport.findUnique({
      where: { id: params.id },
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
            chiefdom: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        evidenceCollections: {
          include: {
            collector: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            collectedDate: "desc",
          },
        },
        deforestationAlerts: {
          select: {
            id: true,
            alertCode: true,
            severity: true,
            status: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Field officers can only view their own reports
    if (user.role === "FIELD_OFFICER" && report.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Check permissions
    const report = await prisma.fieldReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Field officers can only update their own reports
    if (user.role === "FIELD_OFFICER" && report.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.fieldReport.update({
      where: { id: params.id },
      data: body,
      include: {
        forestRegion: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const report = await prisma.fieldReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Only admins or report owner can delete
    if (user.role !== "ADMIN" && report.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.fieldReport.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
