/**
 * NDVI (Normalized Difference Vegetation Index) Calculator
 * NDVI = (NIR - Red) / (NIR + Red)
 * Range: -1 to 1
 * -1 to 0: Water, built-up areas
 * 0 to 0.3: Sparse vegetation, bare soil
 * 0.3 to 0.6: Moderate vegetation
 * 0.6 to 1: Dense vegetation
 */

interface NDVICalculation {
  ndvi: number;
  classification: "water" | "sparse" | "moderate" | "dense";
  health: "poor" | "fair" | "good" | "excellent";
}

interface NDVIChange {
  before: number;
  after: number;
  change: number;
  changePercent: number;
  severity: "none" | "low" | "medium" | "high" | "critical";
}

export class NDVICalculator {
  /**
   * Calculate NDVI from Red and NIR band values
   */
  static calculate(red: number, nir: number): NDVICalculation {
    // Ensure values are in valid range (0-1 for normalized, or 0-10000 for raw)
    const normalizedRed = red > 1 ? red / 10000 : red;
    const normalizedNIR = nir > 1 ? nir / 10000 : nir;

    // Avoid division by zero
    const denominator = normalizedNIR + normalizedRed;
    if (denominator === 0) {
      return {
        ndvi: 0,
        classification: "water",
        health: "poor",
      };
    }

    const ndvi = (normalizedNIR - normalizedRed) / denominator;

    return {
      ndvi: Math.max(-1, Math.min(1, ndvi)), // Clamp to [-1, 1]
      classification: this.classifyNDVI(ndvi),
      health: this.assessHealth(ndvi),
    };
  }

  /**
   * Calculate NDVI change between two time periods
   */
  static calculateChange(beforeNDVI: number, afterNDVI: number): NDVIChange {
    const change = afterNDVI - beforeNDVI;
    const changePercent = beforeNDVI !== 0 ? (change / Math.abs(beforeNDVI)) * 100 : 0;

    return {
      before: beforeNDVI,
      after: afterNDVI,
      change,
      changePercent,
      severity: this.assessChangeSeverity(change, changePercent),
    };
  }

  /**
   * Classify NDVI value
   */
  private static classifyNDVI(ndvi: number): "water" | "sparse" | "moderate" | "dense" {
    if (ndvi < 0) return "water";
    if (ndvi < 0.3) return "sparse";
    if (ndvi < 0.6) return "moderate";
    return "dense";
  }

  /**
   * Assess vegetation health based on NDVI
   */
  private static assessHealth(ndvi: number): "poor" | "fair" | "good" | "excellent" {
    if (ndvi < 0.2) return "poor";
    if (ndvi < 0.4) return "fair";
    if (ndvi < 0.7) return "good";
    return "excellent";
  }

  /**
   * Assess severity of NDVI change (deforestation indicator)
   */
  private static assessChangeSeverity(
    change: number,
    changePercent: number
  ): "none" | "low" | "medium" | "high" | "critical" {
    // Negative change indicates vegetation loss
    if (change >= -0.1 || changePercent >= -10) return "none";
    if (change >= -0.2 || changePercent >= -20) return "low";
    if (change >= -0.3 || changePercent >= -30) return "medium";
    if (change >= -0.5 || changePercent >= -50) return "high";
    return "critical";
  }

  /**
   * Calculate average NDVI for a region
   */
  static calculateAverage(ndviValues: number[]): number {
    if (ndviValues.length === 0) return 0;
    const sum = ndviValues.reduce((acc, val) => acc + val, 0);
    return sum / ndviValues.length;
  }

  /**
   * Detect deforestation from NDVI change
   */
  static detectDeforestation(
    beforeNDVI: number,
    afterNDVI: number,
    threshold: number = -0.2
  ): boolean {
    const change = afterNDVI - beforeNDVI;
    return change < threshold && afterNDVI < 0.3; // Significant drop and low vegetation
  }

  /**
   * Calculate NDVI statistics for an image
   */
  static calculateStatistics(ndviValues: number[]): {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  } {
    if (ndviValues.length === 0) {
      return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }

    const sorted = [...ndviValues].sort((a, b) => a - b);
    const mean = this.calculateAverage(ndviValues);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Calculate standard deviation
    const variance =
      ndviValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      ndviValues.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, min, max, stdDev };
  }
}
