/**
 * Unified Notification Service
 * Coordinates all notification channels
 */

import { emailService } from "./emailService";
import { smsService } from "./smsService";
import { whatsappService } from "./whatsappService";
import { pushNotificationService } from "./pushNotification";
import prisma from "@/lib/db/connect";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "push" | "in_app";

// Map schema enum to internal channel type
const mapChannel = (channel: string): NotificationChannel => {
  const mapping: Record<string, NotificationChannel> = {
    "IN_APP": "in_app",
    "EMAIL": "email",
    "SMS": "sms",
    "WHATSAPP": "whatsapp",
  };
  return mapping[channel] || "in_app";
};

interface AlertNotificationData {
  alertId: string;
  alertCode: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  region: string;
  district: string;
  areaHectares: number;
  detectedDate: string;
  alertUrl: string;
}

interface UserNotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  severityThreshold?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  subscribedRegions?: string[];
}

export class NotificationService {
  /**
   * Send notification via all configured channels
   */
  async sendNotification(
    userId: string,
    channels: NotificationChannel[],
    data: AlertNotificationData
  ): Promise<{
    success: boolean;
    results: Record<NotificationChannel, { success: boolean; error?: string }>;
  }> {
    const results: Record<string, { success: boolean; error?: string }> = {};

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
      },
    });

    // Get push subscription from separate table or user metadata
    // For now, we'll check if there's a push subscription stored elsewhere
    // In production, you might want to add a PushSubscription model
    let pushSubscription = null;
    try {
      // Check if user has push subscription in a separate table or JSON field
      // This is a placeholder - adjust based on your schema
    } catch (error) {
      // Push subscription not available
    }

    if (!user) {
      return {
        success: false,
        results: {},
      };
    }

    // Send via each channel
    for (const channel of channels) {
      try {
        switch (channel) {
          case "email":
            if (user.email) {
              const result = await emailService.sendAlertEmail(user.email, {
                alertCode: data.alertCode,
                severity: data.severity,
                region: data.region,
                areaHectares: data.areaHectares,
                detectedDate: data.detectedDate,
                alertUrl: data.alertUrl,
              });
              results.email = result;
            }
            break;

          case "sms":
            if (user.phone) {
              const result = await smsService.sendAlertSMS(user.phone, {
                alertCode: data.alertCode,
                severity: data.severity,
                region: data.region,
                areaHectares: data.areaHectares,
              });
              results.sms = result;
            }
            break;

          case "whatsapp":
            if (user.phone) {
              const result = await whatsappService.sendAlertWhatsApp(user.phone, {
                alertCode: data.alertCode,
                severity: data.severity,
                region: data.region,
                areaHectares: data.areaHectares,
                detectedDate: data.detectedDate,
                alertUrl: data.alertUrl,
              });
              results.whatsapp = result;
            }
            break;

          case "push":
            if (pushSubscription) {
              const subscription = typeof pushSubscription === 'string' 
                ? JSON.parse(pushSubscription) 
                : pushSubscription;
              const result = await pushNotificationService.sendAlertPush(subscription, {
                alertCode: data.alertCode,
                severity: data.severity,
                region: data.region,
                areaHectares: data.areaHectares,
                alertId: data.alertId,
              });
              results.push = result;
            }
            break;

          case "in_app":
            // Create in-app notification
            await prisma.notification.create({
              data: {
                userId,
                title: `${data.severity} Alert: ${data.alertCode}`,
                message: `Deforestation detected in ${data.region}. Area: ${data.areaHectares.toFixed(2)} ha`,
                type: "ALERT_CREATED",
                alertId: data.alertId,
              },
            });
            results.in_app = { success: true };
            break;
        }
      } catch (error) {
        results[channel] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    const success = Object.values(results).some((r) => r.success);

    return {
      success,
      results: results as Record<NotificationChannel, { success: boolean; error?: string }>,
    };
  }

  /**
   * Notify users based on their subscriptions
   */
  async notifySubscribers(alertData: AlertNotificationData): Promise<void> {
    // Get alert's region ID
    const alert = await prisma.deforestationAlert.findUnique({
      where: { id: alertData.alertId },
      select: { forestRegionId: true },
    });

    if (!alert) return;

    // Get all active subscriptions that match
    const subscriptions = await prisma.alertSubscription.findMany({
      where: {
        isActive: true,
        OR: [
          { regionIds: { has: alert.forestRegionId } }, // Subscribed to this region
          { regionIds: { isEmpty: true } }, // Subscribed to all regions
        ],
        minSeverity: { lte: alertData.severity }, // Severity threshold check
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send notifications to each subscriber
    for (const subscription of subscriptions) {
      const channels = (subscription.channels as string[]).map(c => 
        mapChannel(c)
      );
      
      await this.sendNotification(subscription.userId, channels, {
        ...alertData,
        alertUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${alertData.alertUrl}`,
      });
    }
  }

  /**
   * Send notification to specific users
   */
  async notifyUsers(
    userIds: string[],
    channels: NotificationChannel[],
    data: AlertNotificationData
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification(userId, channels, data);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
