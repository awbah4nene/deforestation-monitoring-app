import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole([UserRole.ADMIN, UserRole.GOVERNMENT_OFFICIAL, UserRole.FIELD_OFFICER]);
    
    const body = await request.json();
    const { assignedToId } = body;

    if (!assignedToId) {
      return NextResponse.json(
        { error: "assignedToId is required" },
        { status: 400 }
      );
    }

    // Verify the assigned user exists and is active
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!assignedUser) {
      return NextResponse.json(
        { error: "Assigned user not found" },
        { status: 404 }
      );
    }

    if (!assignedUser.isActive) {
      return NextResponse.json(
        { error: "Cannot assign to inactive user" },
        { status: 400 }
      );
    }

    const alert = await prisma.deforestationAlert.update({
      where: { id: params.id },
      data: {
        assignedToId,
        status: "IN_PROGRESS",
      },
      include: {
        forestRegion: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification for assigned user
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: "New Alert Assigned",
        message: `You have been assigned alert ${alert.alertCode} in ${alert.forestRegion.name}`,
        type: "ALERT_ASSIGNED",
        alertId: alert.id,
      },
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error assigning alert:", error);
    return NextResponse.json(
      { error: "Failed to assign alert" },
      { status: 500 }
    );
  }
}
