/**
 * Email Notification Service
 * Supports Resend and SendGrid
 */

interface EmailConfig {
  provider: "resend" | "sendgrid";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig = {}) {
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as "resend" | "sendgrid") || "resend",
      apiKey: process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || "alerts@deforestation-monitor.sl",
      fromName: process.env.EMAIL_FROM_NAME || "Deforestation Monitor",
      ...config,
    };
  }

  /**
   * Send email notification
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      console.warn("Email API key not configured. Email not sent.");
      return { success: false, error: "Email API key not configured" };
    }

    try {
      if (this.config.provider === "resend") {
        return await this.sendViaResend(options);
      } else {
        return await this.sendViaSendGrid(options);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send via Resend API
   */
  private async sendViaResend(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        ...(options.cc && { cc: Array.isArray(options.cc) ? options.cc : [options.cc] }),
        ...(options.bcc && { bcc: Array.isArray(options.bcc) ? options.bcc : [options.bcc] }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  }

  /**
   * Send via SendGrid API
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        personalizations: [
          {
            to: recipients.map((email) => ({ email })),
            ...(options.cc && {
              cc: (Array.isArray(options.cc) ? options.cc : [options.cc]).map((email) => ({ email })),
            }),
            ...(options.bcc && {
              bcc: (Array.isArray(options.bcc) ? options.bcc : [options.bcc]).map((email) => ({ email })),
            }),
          },
        ],
        subject: options.subject,
        content: [
          {
            type: "text/html",
            value: options.html,
          },
          ...(options.text
            ? [
                {
                  type: "text/plain",
                  value: options.text,
                },
              ]
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: error || "Failed to send email",
      };
    }

    // SendGrid returns 202 Accepted, message ID in headers
    const messageId = response.headers.get("x-message-id");

    return {
      success: true,
      messageId: messageId || undefined,
    };
  }

  /**
   * Send deforestation alert email
   */
  async sendAlertEmail(
    to: string,
    alert: {
      alertCode: string;
      severity: string;
      region: string;
      areaHectares: number;
      detectedDate: string;
      alertUrl: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const severityColors: Record<string, string> = {
      CRITICAL: "#dc2626",
      HIGH: "#ea580c",
      MEDIUM: "#eab308",
      LOW: "#22c55e",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${severityColors[alert.severity] || "#059669"}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-box { background: white; padding: 15px; border-left: 4px solid ${severityColors[alert.severity] || "#059669"}; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Deforestation Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Alert: ${alert.alertCode}</h2>
                <p><strong>Severity:</strong> <span style="color: ${severityColors[alert.severity] || "#059669"}">${alert.severity}</span></p>
                <p><strong>Region:</strong> ${alert.region}</p>
                <p><strong>Area Affected:</strong> ${alert.areaHectares.toFixed(2)} hectares</p>
                <p><strong>Detected:</strong> ${new Date(alert.detectedDate).toLocaleString()}</p>
              </div>
              <p>Action required: Please review this alert and take appropriate measures.</p>
              <a href="${alert.alertUrl}" class="button">View Alert Details</a>
            </div>
            <div class="footer">
              <p>This is an automated notification from the Deforestation Monitoring System.</p>
              <p>Northern Region, Sierra Leone</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `🚨 ${alert.severity} Alert: ${alert.alertCode} - ${alert.region}`,
      html,
      text: `Deforestation Alert: ${alert.alertCode}\n\nSeverity: ${alert.severity}\nRegion: ${alert.region}\nArea: ${alert.areaHectares.toFixed(2)} ha\nDetected: ${new Date(alert.detectedDate).toLocaleString()}\n\nView: ${alert.alertUrl}`,
    });
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
