import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { alertIds, action } = body;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: "Alert IDs are required" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Parse action (format: "status:NEW_STATUS" or "assign:USER_ID")
    const [actionType, actionValue] = action.split(":");

    let updateData: any = {};

    if (actionType === "status") {
      updateData.status = actionValue;
    } else if (actionType === "assign") {
      updateData.assignedToId = actionValue;
    } else {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    // Update all selected alerts
    const result = await prisma.deforestationAlert.updateMany({
      where: {
        id: { in: alertIds },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
