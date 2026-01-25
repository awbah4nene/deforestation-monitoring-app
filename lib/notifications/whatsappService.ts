/**
 * WhatsApp Business API Service
 * Uses Twilio WhatsApp API or Meta WhatsApp Business API
 */

interface WhatsAppConfig {
  provider: "twilio" | "meta";
  accountSid?: string;
  authToken?: string;
  fromNumber?: string; // Twilio WhatsApp number (format: whatsapp:+1234567890)
  phoneNumberId?: string; // Meta WhatsApp Business Phone Number ID
  accessToken?: string; // Meta WhatsApp Business API Access Token
}

interface WhatsAppOptions {
  to: string; // Format: whatsapp:+1234567890 or +1234567890
  message: string;
  mediaUrl?: string; // Optional image/video URL
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig = {}) {
    this.config = {
      provider: (process.env.WHATSAPP_PROVIDER as "twilio" | "meta") || "twilio",
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_WHATSAPP_NUMBER || process.env.WHATSAPP_FROM_NUMBER,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      ...config,
    };
  }

  /**
   * Send WhatsApp message
   */
  async send(options: WhatsAppOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (this.config.provider === "twilio") {
      return await this.sendViaTwilio(options);
    } else {
      return await this.sendViaMeta(options);
    }
  }

  /**
   * Send via Twilio WhatsApp API
   */
  private async sendViaTwilio(options: WhatsAppOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      console.warn("Twilio WhatsApp credentials not configured. Message not sent.");
      return { success: false, error: "Twilio WhatsApp credentials not configured" };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;

      // Format phone numbers
      const to = options.to.startsWith("whatsapp:") ? options.to : `whatsapp:${options.to}`;
      const from = this.config.fromNumber.startsWith("whatsapp:")
        ? this.config.fromNumber
        : `whatsapp:${this.config.fromNumber}`;

      const formData = new URLSearchParams();
      formData.append("From", from);
      formData.append("To", to);
      formData.append("Body", options.message);
      if (options.mediaUrl) {
        formData.append("MediaUrl", options.mediaUrl);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Failed to send WhatsApp message",
        };
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send via Meta WhatsApp Business API
   */
  private async sendViaMeta(options: WhatsAppOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.phoneNumberId || !this.config.accessToken) {
      console.warn("Meta WhatsApp credentials not configured. Message not sent.");
      return { success: false, error: "Meta WhatsApp credentials not configured" };
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`;

      // Format phone number (remove + and ensure it's just digits)
      const to = options.to.replace(/[^\d]/g, "");

      const body: any = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: options.message,
        },
      };

      // Add media if provided
      if (options.mediaUrl) {
        body.type = "image";
        body.image = {
          link: options.mediaUrl,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || "Failed to send WhatsApp message",
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send deforestation alert via WhatsApp
   */
  async sendAlertWhatsApp(
    to: string,
    alert: {
      alertCode: string;
      severity: string;
      region: string;
      areaHectares: number;
      detectedDate: string;
      alertUrl?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emoji = alert.severity === "CRITICAL" ? "🚨" : alert.severity === "HIGH" ? "⚠️" : "📢";
    
    const message = `${emoji} *DEFORESTATION ALERT*\n\n` +
      `*Code:* ${alert.alertCode}\n` +
      `*Severity:* ${alert.severity}\n` +
      `*Region:* ${alert.region}\n` +
      `*Area:* ${alert.areaHectares.toFixed(2)} hectares\n` +
      `*Detected:* ${new Date(alert.detectedDate).toLocaleString()}\n\n` +
      `Action required. Please review this alert.` +
      (alert.alertUrl ? `\n\nView: ${alert.alertUrl}` : "");

    return this.send({
      to,
      message,
    });
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
