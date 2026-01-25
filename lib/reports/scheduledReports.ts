/**
 * Scheduled Reports System
 * Automated report generation and distribution
 */

import prisma from "@/lib/db/connect";
import { notificationService } from "@/lib/notifications";
import { PDFGenerator } from "./pdfGenerator";
import { GeoJSONExporter } from "./geojsonExporter";

export interface ScheduledReportConfig {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[]; // User IDs
  reportType: "alerts" | "analytics" | "summary";
  format: "pdf" | "excel" | "geojson";
  enabled: boolean;
}

export class ScheduledReportsService {
  /**
   * Generate and send scheduled reports
   */
  static async generateAndSend(config: ScheduledReportConfig): Promise<void> {
    if (!config.enabled) return;

    const dateRange = this.getDateRange(config.frequency);
    
    let reportData: any;
    let fileBlob: Blob | null = null;
    let filename: string;

    // Generate report based on type
    switch (config.reportType) {
      case "alerts":
        reportData = await this.generateAlertsReport(dateRange);
        fileBlob = await PDFGenerator.generateAlertReport(
          reportData.alerts,
          dateRange
        );
        filename = `alerts_report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;

      case "analytics":
        reportData = await this.generateAnalyticsReport(dateRange);
        fileBlob = await PDFGenerator.generateAnalyticsReport(
          reportData,
          dateRange
        );
        filename = `analytics_report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;

      case "summary":
        reportData = await this.generateSummaryReport(dateRange);
        fileBlob = await PDFGenerator.generate({
          title: "Weekly Summary Report",
          subtitle: "Deforestation Monitoring Summary",
          dateRange,
          data: reportData,
          tables: [
            {
              headers: ["Metric", "Value"],
              rows: Object.entries(reportData.summary).map(([key, value]) => [
                key,
                String(value),
              ]),
            },
          ],
        });
        filename = `summary_report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;
    }

    // Send to recipients
    if (fileBlob && config.recipients.length > 0) {
      for (const userId of config.recipients) {
        await this.sendReportToUser(userId, fileBlob, filename, config.name);
      }
    }
  }

  /**
   * Get date range based on frequency
   */
  private static getDateRange(frequency: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (frequency) {
      case "daily":
        start = new Date(end);
        start.setDate(start.getDate() - 1);
        break;
      case "weekly":
        start = new Date(end);
        start.setDate(start.getDate() - 7);
        break;
      case "monthly":
        start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start = new Date(end);
        start.setDate(start.getDate() - 7);
    }

    return { start, end };
  }

  /**
   * Generate alerts report data
   */
  private static async generateAlertsReport(dateRange: { start: Date; end: Date }) {
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      include: {
        forestRegion: {
          select: {
            name: true,
            district: true,
          },
        },
      },
    });

    return { alerts };
  }

  /**
   * Generate analytics report data
   */
  private static async generateAnalyticsReport(dateRange: { start: Date; end: Date }) {
    // Fetch analytics data (simplified - would use actual analytics endpoints)
    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    });

    // Calculate trends
    const trends = this.calculateTrends(alerts);
    const regional = this.calculateRegional(alerts);
    const severity = this.calculateSeverity(alerts);

    return {
      trends,
      regional,
      severity,
      summary: {
        "Total Alerts": alerts.length,
        "Total Area": alerts.reduce((sum, a) => sum + (a.areaHectares || 0), 0).toFixed(2) + " ha",
      },
    };
  }

  /**
   * Generate summary report data
   */
  private static async generateSummaryReport(dateRange: { start: Date; end: Date }) {
    const [alerts, reports, patrols] = await Promise.all([
      prisma.deforestationAlert.count({
        where: {
          detectedDate: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      prisma.fieldReport.count({
        where: {
          reportDate: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      prisma.patrolRoute.count({
        where: {
          plannedDate: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
    ]);

    return {
      summary: {
        "Total Alerts": alerts,
        "Total Reports": reports,
        "Total Patrols": patrols,
        "Period": `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
      },
    };
  }

  /**
   * Calculate trends (simplified)
   */
  private static calculateTrends(alerts: any[]) {
    // Simplified trend calculation
    const grouped: Record<string, { date: string; count: number; totalArea: number }> = {};
    
    alerts.forEach((alert) => {
      const date = new Date(alert.detectedDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!grouped[key]) {
        grouped[key] = { date: key, count: 0, totalArea: 0 };
      }
      
      grouped[key].count++;
      grouped[key].totalArea += alert.areaHectares || 0;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate regional data (simplified)
   */
  private static calculateRegional(alerts: any[]) {
    // Simplified regional calculation
    return [];
  }

  /**
   * Calculate severity distribution (simplified)
   */
  private static calculateSeverity(alerts: any[]) {
    const distribution: Record<string, number> = {};
    
    alerts.forEach((alert) => {
      distribution[alert.severity] = (distribution[alert.severity] || 0) + 1;
    });

    return {
      distribution: Object.entries(distribution).map(([severity, count]) => ({
        severity,
        count,
        percentage: (count / alerts.length) * 100,
      })),
    };
  }

  /**
   * Send report to user
   */
  private static async sendReportToUser(
    userId: string,
    fileBlob: Blob,
    filename: string,
    reportName: string
  ): Promise<void> {
    // In production, you would:
    // 1. Save file to storage (S3, etc.)
    // 2. Get download URL
    // 3. Send email with download link
    // 4. Create notification

    // For now, create notification
    await prisma.notification.create({
      data: {
        userId,
        title: `Scheduled Report: ${reportName}`,
        message: `Your scheduled report "${reportName}" is ready for download.`,
        type: "REPORT_READY",
      },
    });

    // In production, also send email with file attachment or download link
  }
}
