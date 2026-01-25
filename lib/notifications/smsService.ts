/**
 * SMS Notification Service
 * Uses Twilio API
 */

interface SMSConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig = {}) {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
      ...config,
    };
  }

  /**
   * Send SMS notification
   */
  async send(options: SMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      console.warn("Twilio credentials not configured. SMS not sent.");
      return { success: false, error: "Twilio credentials not configured" };
    }

    try {
      // Twilio API endpoint
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append("From", this.config.fromNumber);
      formData.append("To", options.to);
      formData.append("Body", options.message);

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
          error: data.message || "Failed to send SMS",
        };
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error("Error sending SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send deforestation alert SMS
   */
  async sendAlertSMS(
    to: string,
    alert: {
      alertCode: string;
      severity: string;
      region: string;
      areaHectares: number;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `🚨 DEFORESTATION ALERT\n\nCode: ${alert.alertCode}\nSeverity: ${alert.severity}\nRegion: ${alert.region}\nArea: ${alert.areaHectares.toFixed(2)} ha\n\nAction required. Check dashboard for details.`;

    return this.send({
      to,
      message,
    });
  }

  /**
   * Send bulk SMS
   */
  async sendBulk(recipients: string[], message: string): Promise<Array<{ to: string; success: boolean; error?: string }>> {
    const results = await Promise.all(
      recipients.map(async (to) => {
        const result = await this.send({ to, message });
        return {
          to,
          success: result.success,
          error: result.error,
        };
      })
    );

    return results;
  }
}

// Export singleton instance
export const smsService = new SMSService();
