/**
 * Browser Push Notification Service
 * Uses Web Push API
 */

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  tag?: string;
}

export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
  }

  /**
   * Get VAPID public key for client subscription
   */
  getPublicKey(): string {
    return this.vapidPublicKey;
  }

  /**
   * Send push notification
   */
  async send(subscription: PushSubscription, options: PushOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      console.warn("VAPID keys not configured. Push notification not sent.");
      return { success: false, error: "VAPID keys not configured" };
    }

    try {
      // In production, use web-push library
      // For now, this is a placeholder that would call the web-push library
      // const webpush = require('web-push');
      // webpush.setVapidDetails(
      //   'mailto:your-email@example.com',
      //   this.vapidPublicKey,
      //   this.vapidPrivateKey
      // );
      // await webpush.sendNotification(subscription, JSON.stringify(options));

      // Placeholder implementation
      console.log("Push notification would be sent:", { subscription, options });
      
      return { success: true };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send deforestation alert push notification
   */
  async sendAlertPush(
    subscription: PushSubscription,
    alert: {
      alertCode: string;
      severity: string;
      region: string;
      areaHectares: number;
      alertId: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const severityEmoji: Record<string, string> = {
      CRITICAL: "🚨",
      HIGH: "⚠️",
      MEDIUM: "📢",
      LOW: "ℹ️",
    };

    return this.send(subscription, {
      title: `${severityEmoji[alert.severity] || "🚨"} ${alert.severity} Alert: ${alert.alertCode}`,
      body: `Deforestation detected in ${alert.region}. Area: ${alert.areaHectares.toFixed(2)} ha`,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        alertId: alert.alertId,
        alertCode: alert.alertCode,
        url: `/dashboard/alerts/${alert.alertId}`,
      },
      tag: `alert-${alert.alertId}`,
      requireInteraction: alert.severity === "CRITICAL" || alert.severity === "HIGH",
      actions: [
        {
          action: "view",
          title: "View Alert",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    });
  }

  /**
   * Validate push subscription
   */
  validateSubscription(subscription: PushSubscription): boolean {
    return !!(
      subscription.endpoint &&
      subscription.keys &&
      subscription.keys.p256dh &&
      subscription.keys.auth
    );
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
