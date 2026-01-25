/**
 * Alert Subscriptions API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const subscriptions = await prisma.alertSubscription.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch region details for each subscription
    const subscriptionsWithRegions = await Promise.all(
      subscriptions.map(async (sub) => {
        const regions = sub.regionIds.length > 0
          ? await prisma.forestRegion.findMany({
              where: { id: { in: sub.regionIds } },
              select: {
                id: true,
                name: true,
                district: true,
              },
            })
          : [];
        
        return {
          ...sub,
          regions,
        };
      })
    );

    return NextResponse.json({ subscriptions: subscriptionsWithRegions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      regionIds,
      minSeverity,
      channels,
      isActive = true,
    } = body;

    // Validate channels (matching schema enum)
    const validChannels = ["EMAIL", "SMS", "WHATSAPP", "IN_APP"];
    const subscriptionChannels = Array.isArray(channels)
      ? channels.filter((c) => validChannels.includes(c.toUpperCase())).map(c => c.toUpperCase() as "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP")
      : ["IN_APP"];

    // Check if subscription already exists (simplified - you might want more specific matching)
    const existing = await prisma.alertSubscription.findFirst({
      where: {
        userId: user.id,
        minSeverity: minSeverity || "MEDIUM",
      },
    });

    if (existing) {
      // Update existing subscription
      const subscription = await prisma.alertSubscription.update({
        where: { id: existing.id },
        data: {
          regionIds: regionIds || [],
          channels: subscriptionChannels as any,
          isActive,
        },
      });

      return NextResponse.json({ subscription });
    }

    // Create new subscription
    const subscription = await prisma.alertSubscription.create({
      data: {
        userId: user.id,
        regionIds: regionIds || [],
        minSeverity: minSeverity || "MEDIUM",
        channels: subscriptionChannels as any,
        isActive,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
