import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Try to fetch with organization field first
    let userProfile;
    try {
      userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          organization: true,
          position: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
    } catch (selectError: any) {
      // If organization field doesn't exist, fetch without it
      if (selectError.message?.includes("organization")) {
        console.warn("Organization field not available, fetching without it");
        userProfile = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            position: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        });
        // Add organization as null if not available
        if (userProfile) {
          (userProfile as any).organization = null;
        }
      } else {
        throw selectError;
      }
    }

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userProfile });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    
    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Only update fields that are provided and allowed
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    // Only include organization if it exists in the schema
    if (body.organization !== undefined) {
      try {
        updateData.organization = body.organization || null;
      } catch (e) {
        // Field doesn't exist, skip it
        console.warn("Organization field not available for update");
      }
    }
    if (body.position !== undefined) updateData.position = body.position || null;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null;

    // Try to update with organization, fallback without it
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          organization: true,
          position: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
    } catch (updateError: any) {
      // If organization field doesn't exist, update without it
      if (updateError.message?.includes("organization")) {
        const { organization, ...dataWithoutOrg } = updateData;
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: dataWithoutOrg,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            position: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        });
        // Add organization as null if not available
        (updatedUser as any).organization = null;
      } else {
        throw updateError;
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    
    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
