/**
 * Start Patrol API
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

    const patrol = await prisma.patrolRoute.update({
      where: { id: params.id },
      data: {
        status: "IN_PROGRESS",
        startDate: new Date(),
      },
      include: {
        forestRegion: true,
        assignedUsers: true,
      },
    });

    return NextResponse.json({ patrol });
  } catch (error) {
    console.error("Error starting patrol:", error);
    return NextResponse.json(
      { error: "Failed to start patrol" },
      { status: 500 }
    );
  }
}
