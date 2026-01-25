/**
 * Server-Sent Events (SSE) for Real-time Notifications
 * Alternative to WebSocket for Next.js
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
        );

        // Poll for new notifications every 5 seconds
        let lastNotificationId: string | null = null;

        const pollInterval = setInterval(async () => {
          try {
            // Get latest notification
            const latestNotification = await prisma.notification.findFirst({
              where: {
                userId: user.id,
                ...(lastNotificationId && {
                  id: { not: lastNotificationId },
                  createdAt: { gt: new Date(Date.now() - 10000) }, // Last 10 seconds
                }),
              },
              orderBy: { createdAt: "desc" },
            });

            if (latestNotification) {
              lastNotificationId = latestNotification.id;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "notification",
                    notification: latestNotification,
                  })}\n\n`
                )
              );
            }

            // Send heartbeat
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`)
            );
          } catch (error) {
            console.error("Error in SSE stream:", error);
            clearInterval(pollInterval);
            controller.close();
          }
        }, 5000); // Poll every 5 seconds

        // Cleanup on client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(pollInterval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error setting up SSE stream:", error);
    return new Response("Error setting up stream", { status: 500 });
  }
}
