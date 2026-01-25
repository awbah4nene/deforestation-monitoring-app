import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const alert = await prisma.deforestationAlert.findUnique({
      where: { id: params.id },
      include: {
        forestRegion: {
          select: {
            name: true,
            regionCode: true,
            district: true,
            chiefdom: true,
            areaHectares: true,
            vegetationType: true,
            protectionStatus: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        satelliteImage: {
          select: {
            id: true,
            source: true,
            imageDate: true,
            resolution: true,
            cloudCover: true,
          },
        },
        alertComments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        fieldReports: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reportDate: "desc",
          },
        },
        cases: {
          include: {
            openedBy: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error fetching alert:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert" },
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

    const alert = await prisma.deforestationAlert.update({
      where: { id: params.id },
      data: body,
      include: {
        forestRegion: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
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

    await prisma.deforestationAlert.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
