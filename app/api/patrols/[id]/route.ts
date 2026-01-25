/**
 * Patrol Route Detail API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const patrol = await prisma.patrolRoute.findUnique({
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
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        patrolReports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reportDate: "desc",
          },
        },
      },
    });

    if (!patrol) {
      return NextResponse.json({ error: "Patrol not found" }, { status: 404 });
    }

    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("Error fetching patrol:", error);
    return NextResponse.json(
      { error: "Failed to fetch patrol" },
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

    const patrol = await prisma.patrolRoute.update({
      where: { id: params.id },
      data: body,
      include: {
        forestRegion: true,
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("Error updating patrol:", error);
    return NextResponse.json(
      { error: "Failed to update patrol" },
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

    await prisma.patrolRoute.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Patrol deleted successfully" });
  } catch (error) {
    console.error("Error deleting patrol:", error);
    return NextResponse.json(
      { error: "Failed to delete patrol" },
      { status: 500 }
    );
  }
}
