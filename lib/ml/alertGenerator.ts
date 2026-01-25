/**
 * Automated Alert Generator
 * Generates deforestation alerts from ML detection results
 */

import prisma from "@/lib/db/connect";
import { DetectionResult } from "./deforestationDetector";
import { ChangeDetectionResult } from "./changeDetection";

interface AlertGenerationOptions {
  minConfidence?: number;
  minArea?: number; // hectares
  severityThresholds?: {
    critical: number;
    high: number;
    medium: number;
  };
  autoAssign?: boolean;
  notifyUsers?: boolean;
}

interface GeneratedAlert {
  id: string;
  alertCode: string;
  forestRegionId: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  areaHectares: number;
  detectedDate: Date;
  status: "PENDING";
}

export class AlertGenerator {
  private options: AlertGenerationOptions;

  constructor(options: AlertGenerationOptions = {}) {
    this.options = {
      minConfidence: 0.7,
      minArea: 0.1, // 0.1 hectares minimum
      severityThresholds: {
        critical: 0.9,
        high: 0.85,
        medium: 0.7,
      },
      autoAssign: false,
      notifyUsers: true,
      ...options,
    };
  }

  /**
   * Generate alert from detection result
   */
  async generateAlert(
    detectionResult: DetectionResult,
    forestRegionId: string,
    satelliteImageId?: string
  ): Promise<GeneratedAlert | null> {
    // Check if detection meets minimum criteria
    if (
      detectionResult.confidence < (this.options.minConfidence || 0.7) ||
      detectionResult.areaHectares < (this.options.minArea || 0.1)
    ) {
      return null; // Don't generate alert
    }

    // Generate alert code
    const alertCode = await this.generateAlertCode();

    // Determine severity
    const severity = this.determineSeverity(detectionResult.confidence);

    // Create alert in database
    try {
      const alert = await prisma.deforestationAlert.create({
        data: {
          alertCode,
          forestRegionId,
          latitude: (detectionResult.bbox[1] + detectionResult.bbox[3]) / 2,
          longitude: (detectionResult.bbox[0] + detectionResult.bbox[2]) / 2,
          geometry: this.bboxToGeoJSON(detectionResult.bbox),
          areaHectares: detectionResult.areaHectares,
          confidence: detectionResult.confidence,
          severity,
          status: "PENDING",
          priority: this.calculatePriority(severity, detectionResult.confidence),
          detectedDate: new Date(),
          ndviChange: detectionResult.ndviChange,
          brightnessChange: detectionResult.features.brightnessChange,
          ...(satelliteImageId && { satelliteImageId }),
        },
        select: {
          id: true,
          alertCode: true,
          forestRegionId: true,
          confidence: true,
          severity: true,
          areaHectares: true,
          detectedDate: true,
          status: true,
        },
      });

      // Auto-assign if enabled
      if (this.options.autoAssign) {
        await this.autoAssignAlert(alert.id, forestRegionId);
      }

      // Notify users if enabled
      if (this.options.notifyUsers) {
        await this.notifyUsers(alert.id, severity);
      }

      return alert as GeneratedAlert;
    } catch (error) {
      console.error("Error generating alert:", error);
      throw error;
    }
  }

  /**
   * Batch generate alerts from multiple detections
   */
  async batchGenerateAlerts(
    detections: Array<{
      detection: DetectionResult;
      forestRegionId: string;
      satelliteImageId?: string;
    }>
  ): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];

    for (const { detection, forestRegionId, satelliteImageId } of detections) {
      try {
        const alert = await this.generateAlert(detection, forestRegionId, satelliteImageId);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        console.error("Error generating alert in batch:", error);
        // Continue with other alerts
      }
    }

    return alerts;
  }

  /**
   * Generate unique alert code
   */
  private async generateAlertCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Get count of alerts today
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    const count = await prisma.deforestationAlert.count({
      where: {
        detectedDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    return `ALERT-${year}${month}${day}-${sequence}`;
  }

  /**
   * Determine severity based on confidence and thresholds
   */
  private determineSeverity(confidence: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const thresholds = this.options.severityThresholds || {
      critical: 0.9,
      high: 0.85,
      medium: 0.7,
    };

    if (confidence >= thresholds.critical) return "CRITICAL";
    if (confidence >= thresholds.high) return "HIGH";
    if (confidence >= thresholds.medium) return "MEDIUM";
    return "LOW";
  }

  /**
   * Calculate priority (1-10) based on severity and confidence
   */
  private calculatePriority(
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    confidence: number
  ): number {
    const basePriority: Record<string, number> = {
      CRITICAL: 10,
      HIGH: 8,
      MEDIUM: 6,
      LOW: 4,
    };

    const base = basePriority[severity] || 5;
    const confidenceBoost = Math.floor(confidence * 2); // 0-2 point boost

    return Math.min(10, base + confidenceBoost);
  }

  /**
   * Auto-assign alert to field officer
   */
  private async autoAssignAlert(alertId: string, forestRegionId: string): Promise<void> {
    // Find available field officers in the region
    const region = await prisma.forestRegion.findUnique({
      where: { id: forestRegionId },
      select: { district: true },
    });

    if (!region) return;

    // Find field officers with least assigned alerts
    const fieldOfficers = await prisma.user.findMany({
      where: {
        role: "FIELD_OFFICER",
        isActive: true,
      },
      include: {
        _count: {
          select: {
            deforestationAlerts: {
              where: {
                status: { in: ["PENDING", "IN_PROGRESS"] },
              },
            },
          },
        },
      },
      orderBy: {
        deforestationAlerts: {
          _count: "asc",
        },
      },
      take: 1,
    });

    if (fieldOfficers.length > 0) {
      await prisma.deforestationAlert.update({
        where: { id: alertId },
        data: {
          assignedToId: fieldOfficers[0].id,
          status: "IN_PROGRESS",
        },
      });
    }
  }

  /**
   * Notify relevant users about new alert
   */
  private async notifyUsers(alertId: string, severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): Promise<void> {
    // Get alert details for notification
    const alert = await prisma.deforestationAlert.findUnique({
      where: { id: alertId },
      include: {
        forestRegion: {
          select: {
            name: true,
            district: true,
          },
        },
      },
    });

    if (!alert) return;

    // Import notification service
    const { notificationService } = await import("@/lib/notifications");

    // Notify admins and government officials for high/critical alerts
    if (severity === "HIGH" || severity === "CRITICAL") {
      const users = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "GOVERNMENT_OFFICIAL"] },
          isActive: true,
        },
      });

      for (const user of users) {
        await notificationService.sendNotification(
          user.id,
          ["in_app", "email"],
          {
            alertId,
            alertCode: alert.alertCode,
            severity,
            region: alert.forestRegion.name,
            district: alert.forestRegion.district,
            areaHectares: alert.areaHectares,
            detectedDate: alert.detectedDate.toISOString(),
            alertUrl: `/dashboard/alerts/${alertId}`,
          }
        );
      }
    }

    // Notify subscribers
    await notificationService.notifySubscribers({
      alertId,
      alertCode: alert.alertCode,
      severity,
      region: alert.forestRegion.name,
      district: alert.forestRegion.district,
      areaHectares: alert.areaHectares,
      detectedDate: alert.detectedDate.toISOString(),
      alertUrl: `/dashboard/alerts/${alertId}`,
    });
  }

  /**
   * Convert bounding box to GeoJSON
   */
  private bboxToGeoJSON(bbox: [number, number, number, number]): any {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    return {
      type: "Polygon",
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ],
    };
  }
}

// Export singleton instance
export const alertGenerator = new AlertGenerator();
