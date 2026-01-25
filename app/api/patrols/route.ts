/**
 * Patrol Routes API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId");
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");

    const where: any = {};
    if (regionId) where.regionId = regionId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = { has: assignedTo };

    const patrols = await prisma.patrolRoute.findMany({
      where,
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            patrolReports: true,
          },
        },
      },
      orderBy: {
        plannedDate: "asc",
      },
    });

    return NextResponse.json({ patrols });
  } catch (error) {
    console.error("Error fetching patrols:", error);
    return NextResponse.json(
      { error: "Failed to fetch patrols" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([UserRole.ADMIN, UserRole.GOVERNMENT_OFFICIAL, UserRole.FIELD_OFFICER]);
    const body = await request.json();

    const {
      routeName,
      regionId,
      assignedTo,
      plannedDate,
      routeGeometry,
      distance,
      estimatedDuration,
      priority,
      objectives,
      equipmentNeeded,
      safetyNotes,
    } = body;

    const patrol = await prisma.patrolRoute.create({
      data: {
        routeName,
        regionId,
        assignedTo: assignedTo || [],
        plannedDate: new Date(plannedDate),
        routeGeometry: routeGeometry || null,
        distance: distance || null,
        estimatedDuration: estimatedDuration || null,
        priority: priority || 5,
        objectives: objectives || [],
        equipmentNeeded: equipmentNeeded || [],
        safetyNotes: safetyNotes || null,
        status: "PLANNED",
      },
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Notify assigned users
    if (assignedTo && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        await prisma.notification.create({
          data: {
            userId,
            title: "New Patrol Assigned",
            message: `You have been assigned to patrol: ${routeName}`,
            type: "PATROL_ASSIGNED",
          },
        });
      }
    }

    return NextResponse.json({ patrol }, { status: 201 });
  } catch (error) {
    console.error("Error creating patrol:", error);
    return NextResponse.json(
      { error: "Failed to create patrol" },
      { status: 500 }
    );
  }
}
