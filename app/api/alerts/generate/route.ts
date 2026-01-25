/**
 * Automated Alert Generation API
 * Processes satellite images and generates alerts using ML
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { sentinelHub } from "@/lib/satellite/sentinel";
import { ImageProcessor } from "@/lib/satellite/imageProcessor";
import { deforestationDetector } from "@/lib/ml/deforestationDetector";
import { alertGenerator } from "@/lib/ml/alertGenerator";
import prisma from "@/lib/db/connect";

export async function POST(request: NextRequest) {
  try {
    await requireRole([UserRole.ADMIN, UserRole.GOVERNMENT_OFFICIAL]);

    const body = await request.json();
    const { regionId, startDate, endDate, autoProcess = true } = body;

    if (!regionId) {
      return NextResponse.json(
        { error: "Region ID is required" },
        { status: 400 }
      );
    }

    // Fetch region
    const region = await prisma.forestRegion.findUnique({
      where: { id: regionId },
      select: {
        id: true,
        name: true,
        centroid: true,
        areaHectares: true,
      },
    });

    if (!region) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    // Calculate bounding box from centroid (simplified)
    const bbox: [number, number, number, number] = [
      (region.centroid as any).coordinates[0] - 0.1,
      (region.centroid as any).coordinates[1] - 0.1,
      (region.centroid as any).coordinates[0] + 0.1,
      (region.centroid as any).coordinates[1] + 0.1,
    ];

    // Fetch before and after images
    const beforeDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const afterDate = endDate || new Date().toISOString();

    const [beforeImage, afterImage] = await Promise.all([
      sentinelHub.fetchNDVI(bbox, beforeDate),
      sentinelHub.fetchNDVI(bbox, afterDate),
    ]);

    // Process images
    const processedBefore = await ImageProcessor.processImage(beforeImage.imageUrl, {
      source: "sentinel",
      resolution: beforeImage.resolution,
      cloudCover: beforeImage.cloudCover || 0,
      bbox: beforeImage.bbox,
      bands: ["B04", "B08"],
      format: "image/png",
      size: 0,
    }, { calculateNDVI: true });

    const processedAfter = await ImageProcessor.processImage(afterImage.imageUrl, {
      source: "sentinel",
      resolution: afterImage.resolution,
      cloudCover: afterImage.cloudCover || 0,
      bbox: afterImage.bbox,
      bands: ["B04", "B08"],
      format: "image/png",
      size: 0,
    }, { calculateNDVI: true });

    // Store satellite images
    const [beforeSatImage, afterSatImage] = await Promise.all([
      prisma.satelliteImage.create({
        data: {
          forestRegionId: regionId,
          source: "SENTINEL_2",
          imageDate: new Date(beforeDate),
          imagePath: processedBefore.processedUrl,
          resolution: beforeImage.resolution,
          cloudCover: beforeImage.cloudCover || 0,
          metadata: {
            bbox: beforeImage.bbox,
            ndvi: processedBefore.ndvi?.ndvi,
          },
        },
      }),
      prisma.satelliteImage.create({
        data: {
          forestRegionId: regionId,
          source: "SENTINEL_2",
          imageDate: new Date(afterDate),
          imagePath: processedAfter.processedUrl,
          resolution: afterImage.resolution,
          cloudCover: afterImage.cloudCover || 0,
          metadata: {
            bbox: afterImage.bbox,
            ndvi: processedAfter.ndvi?.ndvi,
          },
        },
      }),
    ]);

    // Detect deforestation
    const detectionResult = await deforestationDetector.detect(
      {
        ndvi: processedBefore.ndvi?.ndvi || 0.6,
        brightness: 0.5,
        texture: 0.5,
      },
      {
        ndvi: processedAfter.ndvi?.ndvi || 0.3,
        brightness: 0.6,
        texture: 0.4,
      },
      bbox
    );

    let generatedAlert = null;

    // Generate alert if deforestation detected
    if (autoProcess && detectionResult.detected) {
      generatedAlert = await alertGenerator.generateAlert(
        detectionResult,
        regionId,
        afterSatImage.id
      );

      // Link before image to alert if it exists
      if (generatedAlert) {
        await prisma.deforestationAlert.update({
          where: { id: generatedAlert.id },
          data: {
            beforeImagePath: processedBefore.processedUrl,
            afterImagePath: processedAfter.processedUrl,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      detection: {
        detected: detectionResult.detected,
        confidence: detectionResult.confidence,
        severity: detectionResult.severity,
        areaHectares: detectionResult.areaHectares,
        ndviChange: detectionResult.ndviChange,
      },
      images: {
        before: {
          id: beforeSatImage.id,
          url: processedBefore.processedUrl,
          ndvi: processedBefore.ndvi?.ndvi,
        },
        after: {
          id: afterSatImage.id,
          url: processedAfter.processedUrl,
          ndvi: processedAfter.ndvi?.ndvi,
        },
      },
      alert: generatedAlert,
    });
  } catch (error) {
    console.error("Error generating alert:", error);
    return NextResponse.json(
      { error: "Failed to generate alert", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
