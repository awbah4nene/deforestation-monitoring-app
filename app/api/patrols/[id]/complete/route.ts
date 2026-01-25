/**
 * Complete Patrol API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { completionNotes } = body;

    const patrol = await prisma.patrolRoute.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        endDate: new Date(),
        completedBy: user.id,
        completionNotes: completionNotes || null,
      },
      include: {
        forestRegion: true,
        assignedUsers: true,
      },
    });

    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("Error completing patrol:", error);
    return NextResponse.json(
      { error: "Failed to complete patrol" },
      { status: 500 }
    );
  }
}
