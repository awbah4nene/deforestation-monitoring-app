/**
 * Alert Subscription Management API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Verify ownership
    const subscription = await prisma.alertSubscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription || subscription.userId !== user.id) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.alertSubscription.update({
      where: { id: params.id },
      data: body,
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
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

    // Verify ownership
    const subscription = await prisma.alertSubscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription || subscription.userId !== user.id) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    await prisma.alertSubscription.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
