/**
 * Report Verification API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db/connect";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole([UserRole.ADMIN, UserRole.GOVERNMENT_OFFICIAL]);
    const user = await requireAuth();
    const body = await request.json();

    const { verified, verificationNotes } = body;

    const report = await prisma.fieldReport.update({
      where: { id: params.id },
      data: {
        isVerified: verified,
        verifiedBy: user.id,
        verifiedAt: verified ? new Date() : null,
        verificationNotes: verificationNotes || null,
      },
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

    // Create notification for report creator
    if (verified && report.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          title: "Report Verified",
          message: `Your report ${report.reportCode} has been verified.`,
          type: "REPORT_VERIFIED",
        },
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error verifying report:", error);
    return NextResponse.json(
      { error: "Failed to verify report" },
      { status: 500 }
    );
  }
}
