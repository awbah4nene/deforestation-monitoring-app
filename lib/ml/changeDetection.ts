/**
 * Change Detection Module
 * Detects changes between before/after satellite images
 */

import { NDVICalculator } from "../satellite/ndviCalculator";

interface ChangeDetectionResult {
  hasChange: boolean;
  changeType: "deforestation" | "reforestation" | "no_change" | "other";
  confidence: number;
  metrics: {
    ndviChange: number;
    areaChange: number;
    brightnessChange: number;
    textureChange: number;
  };
  affectedArea: number; // hectares
  bbox: [number, number, number, number];
}

interface ImagePair {
  before: {
    url: string;
    timestamp: string;
    ndvi?: number;
    metadata?: any;
  };
  after: {
    url: string;
    timestamp: string;
    ndvi?: number;
    metadata?: any;
  };
  regionBbox: [number, number, number, number];
}

export class ChangeDetector {
  /**
   * Detect changes between two images
   */
  static async detectChanges(imagePair: ImagePair): Promise<ChangeDetectionResult> {
    const { before, after, regionBbox } = imagePair;

    // Calculate NDVI change
    const beforeNDVI = before.ndvi || 0.6;
    const afterNDVI = after.ndvi || 0.3;
    const ndviChange = afterNDVI - beforeNDVI;

    // Calculate other metrics
    const brightnessChange = this.calculateBrightnessChange(before, after);
    const textureChange = this.calculateTextureChange(before, after);
    const areaChange = this.calculateAreaChange(before, after);

    // Determine change type
    const changeType = this.determineChangeType(ndviChange, brightnessChange);

    // Calculate confidence
    const confidence = this.calculateConfidence(
      ndviChange,
      brightnessChange,
      textureChange
    );

    // Calculate affected area
    const affectedArea = this.calculateAffectedArea(regionBbox, ndviChange);

    return {
      hasChange: Math.abs(ndviChange) > 0.1,
      changeType,
      confidence,
      metrics: {
        ndviChange,
        areaChange,
        brightnessChange,
        textureChange,
      },
      affectedArea,
      bbox: regionBbox,
    };
  }

  /**
   * Detect changes over time series
   */
  static async detectTimeSeriesChanges(
    images: Array<{ timestamp: string; ndvi: number; url: string }>,
    regionBbox: [number, number, number, number]
  ): Promise<{
    trend: "increasing" | "decreasing" | "stable";
    changePoints: Array<{ timestamp: string; change: number }>;
    overallChange: number;
  }> {
    if (images.length < 2) {
      return {
        trend: "stable",
        changePoints: [],
        overallChange: 0,
      };
    }

    // Sort by timestamp
    const sorted = [...images].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate changes between consecutive images
    const changePoints = [];
    for (let i = 1; i < sorted.length; i++) {
      const change = sorted[i].ndvi - sorted[i - 1].ndvi;
      changePoints.push({
        timestamp: sorted[i].timestamp,
        change,
      });
    }

    // Calculate overall trend
    const firstNDVI = sorted[0].ndvi;
    const lastNDVI = sorted[sorted.length - 1].ndvi;
    const overallChange = lastNDVI - firstNDVI;

    let trend: "increasing" | "decreasing" | "stable";
    if (overallChange > 0.1) trend = "increasing";
    else if (overallChange < -0.1) trend = "decreasing";
    else trend = "stable";

    return {
      trend,
      changePoints,
      overallChange,
    };
  }

  /**
   * Calculate brightness change
   */
  private static calculateBrightnessChange(before: any, after: any): number {
    const beforeBrightness = before.metadata?.brightness || 0.5;
    const afterBrightness = after.metadata?.brightness || 0.5;
    return Math.abs(afterBrightness - beforeBrightness);
  }

  /**
   * Calculate texture change
   */
  private static calculateTextureChange(before: any, after: any): number {
    // Simplified texture change calculation
    // In production, use GLCM (Gray-Level Co-occurrence Matrix) or similar
    const beforeTexture = before.metadata?.texture || 0.5;
    const afterTexture = after.metadata?.texture || 0.5;
    return Math.abs(afterTexture - beforeTexture);
  }

  /**
   * Calculate area change
   */
  private static calculateAreaChange(before: any, after: any): number {
    // Simplified - would use actual geometry comparison
    return 0;
  }

  /**
   * Determine change type
   */
  private static determineChangeType(
    ndviChange: number,
    brightnessChange: number
  ): "deforestation" | "reforestation" | "no_change" | "other" {
    if (Math.abs(ndviChange) < 0.1) return "no_change";
    if (ndviChange < -0.2) return "deforestation";
    if (ndviChange > 0.2) return "reforestation";
    return "other";
  }

  /**
   * Calculate confidence in change detection
   */
  private static calculateConfidence(
    ndviChange: number,
    brightnessChange: number,
    textureChange: number
  ): number {
    // Weighted combination of metrics
    const ndviWeight = 0.5;
    const brightnessWeight = 0.3;
    const textureWeight = 0.2;

    const ndviScore = Math.min(1, Math.abs(ndviChange) / 0.5);
    const brightnessScore = Math.min(1, brightnessChange / 0.3);
    const textureScore = Math.min(1, textureChange / 0.3);

    return (
      ndviScore * ndviWeight +
      brightnessScore * brightnessWeight +
      textureScore * textureWeight
    );
  }

  /**
   * Calculate affected area
   */
  private static calculateAffectedArea(
    bbox: [number, number, number, number],
    ndviChange: number
  ): number {
    // Simplified calculation
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    const avgLat = (minLat + maxLat) / 2;

    const latMeters = latDiff * 111320;
    const lonMeters = lonDiff * 111320 * Math.cos((avgLat * Math.PI) / 180);
    const totalArea = (latMeters * lonMeters) / 10000; // hectares

    // Scale by change magnitude
    const changeMagnitude = Math.abs(ndviChange);
    return totalArea * changeMagnitude;
  }

  /**
   * Validate image pair for change detection
   */
  static validateImagePair(imagePair: ImagePair): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!imagePair.before.url) errors.push("Before image URL missing");
    if (!imagePair.after.url) errors.push("After image URL missing");
    if (!imagePair.before.timestamp) errors.push("Before image timestamp missing");
    if (!imagePair.after.timestamp) errors.push("After image timestamp missing");

    const timeDiff =
      new Date(imagePair.after.timestamp).getTime() -
      new Date(imagePair.before.timestamp).getTime();
    if (timeDiff <= 0) errors.push("After image must be after before image");

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
