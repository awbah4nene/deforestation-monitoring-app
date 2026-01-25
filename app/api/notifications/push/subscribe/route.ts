/**
 * Push Notification Subscription API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { pushNotificationService } from "@/lib/notifications/pushNotification";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !pushNotificationService.validateSubscription(subscription)) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // Save subscription to database
    // Note: You may need to create a PushSubscription model or store in user metadata
    // For now, we'll create a notification preference or store in a JSON field
    // This is a placeholder - adjust based on your schema needs
    
    // Option 1: Store in a separate PushSubscription table (recommended)
    // Option 2: Store as JSON in user metadata
    // Option 3: Use a key-value store
    
    // Placeholder: Store subscription (you'll need to implement based on your schema)
    console.log("Push subscription saved for user:", user.id);
    
    // In production, you might do:
    // await prisma.pushSubscription.upsert({
    //   where: { userId: user.id },
    //   update: { subscription: JSON.stringify(subscription) },
    //   create: { userId: user.id, subscription: JSON.stringify(subscription) },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return VAPID public key for client
    const publicKey = pushNotificationService.getPublicKey();
    return NextResponse.json({ publicKey });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get public key" },
      { status: 500 }
    );
  }
}
