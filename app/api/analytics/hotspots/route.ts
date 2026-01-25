/**
 * Predictive Hotspot Map API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Get recent alerts for hotspot prediction
    const recentAlerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: {
        forestRegion: {
          select: {
            id: true,
            name: true,
            geometry: true,
          },
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        severity: true,
        areaHectares: true,
        detectedDate: true,
        forestRegionId: true,
        forestRegion: {
          select: {
            id: true,
            name: true,
            geometry: true,
          },
        },
      },
    });

    // Group alerts by region
    const regionHotspots: Record<string, {
      regionId: string;
      regionName: string;
      alertCount: number;
      totalArea: number;
      averageSeverity: number;
      riskScore: number;
      geometry: any;
      recentAlerts: number;
    }> = {};

    recentAlerts.forEach((alert) => {
      const regionId = alert.forestRegionId;
      
      if (!regionHotspots[regionId]) {
        regionHotspots[regionId] = {
          regionId,
          regionName: alert.forestRegion.name,
          alertCount: 0,
          totalArea: 0,
          averageSeverity: 0,
          riskScore: 0,
          geometry: alert.forestRegion.geometry,
          recentAlerts: 0,
        };
      }

      const severityWeight = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      regionHotspots[regionId].alertCount++;
      regionHotspots[regionId].totalArea += alert.areaHectares || 0;
      regionHotspots[regionId].averageSeverity +=
        severityWeight[alert.severity as keyof typeof severityWeight] || 1;

      // Count recent alerts (last 30 days)
      const daysSince = (Date.now() - new Date(alert.detectedDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 30) {
        regionHotspots[regionId].recentAlerts++;
      }
    });

    // Calculate risk scores
    Object.values(regionHotspots).forEach((hotspot) => {
      hotspot.averageSeverity = hotspot.averageSeverity / hotspot.alertCount;
      
      // Risk score calculation (0-100)
      const alertDensity = hotspot.alertCount / 10; // Normalize
      const severityFactor = hotspot.averageSeverity * 20;
      const recencyFactor = hotspot.recentAlerts * 5;
      const areaFactor = Math.min(hotspot.totalArea / 10, 20); // Cap at 20

      hotspot.riskScore = Math.min(
        alertDensity + severityFactor + recencyFactor + areaFactor,
        100
      );
    });

    // Convert to array and sort by risk score
    const hotspots = Object.values(regionHotspots)
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((hotspot, index) => ({
        ...hotspot,
        rank: index + 1,
        riskLevel: 
          hotspot.riskScore >= 70 ? "HIGH" :
          hotspot.riskScore >= 40 ? "MEDIUM" : "LOW",
      }));

    return NextResponse.json({
      hotspots,
      totalRegions: hotspots.length,
      highRiskRegions: hotspots.filter((h) => h.riskLevel === "HIGH").length,
    });
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotspots" },
      { status: 500 }
    );
  }
}
