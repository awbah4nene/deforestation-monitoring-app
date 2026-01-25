/**
 * Risk Predictor
 * Predicts deforestation hotspots and risk areas
 */

import prisma from "@/lib/db/connect";

interface RiskFactors {
  historicalAlerts: number;
  recentAlerts: number;
  populationDensity: number;
  accessibility: number; // 0-1, higher = more accessible
  protectionStatus: "STRICTLY_PROTECTED" | "PROTECTED" | "COMMUNITY_MANAGED" | "BUFFER_ZONE";
  vegetationType: string;
  elevation: number | null;
  slope: number | null;
}

interface RiskPrediction {
  regionId: string;
  riskScore: number; // 0-1
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: {
    historical: number;
    recent: number;
    environmental: number;
    social: number;
  };
  predictedAlerts: number; // Expected alerts in next 30 days
  confidence: number;
}

export class RiskPredictor {
  /**
   * Predict deforestation risk for a region
   */
  async predictRisk(regionId: string): Promise<RiskPrediction> {
    // Fetch region data
    const region = await prisma.forestRegion.findUnique({
      where: { id: regionId },
      include: {
        _count: {
          select: {
            deforestationAlerts: true,
          },
        },
        deforestationAlerts: {
          where: {
            detectedDate: {
              gte: new Date(new Date().setDate(new Date().getDate() - 90)), // Last 90 days
            },
          },
        },
      },
    });

    if (!region) {
      throw new Error("Region not found");
    }

    // Calculate risk factors
    const factors = await this.calculateRiskFactors(region);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(factors);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);

    // Predict number of alerts
    const predictedAlerts = this.predictAlertCount(factors, riskScore);

    // Calculate confidence
    const confidence = this.calculateConfidence(factors);

    return {
      regionId,
      riskScore,
      riskLevel,
      factors: {
        historical: this.calculateHistoricalFactor(factors),
        recent: this.calculateRecentFactor(factors),
        environmental: this.calculateEnvironmentalFactor(factors),
        social: this.calculateSocialFactor(factors),
      },
      predictedAlerts,
      confidence,
    };
  }

  /**
   * Predict risk for multiple regions
   */
  async batchPredictRisk(regionIds: string[]): Promise<RiskPrediction[]> {
    const predictions = await Promise.all(
      regionIds.map((id) => this.predictRisk(id).catch((error) => {
        console.error(`Error predicting risk for region ${id}:`, error);
        return null;
      }))
    );

    return predictions.filter((p): p is RiskPrediction => p !== null);
  }

  /**
   * Calculate risk factors for a region
   */
  private async calculateRiskFactors(region: any): Promise<RiskFactors> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAlerts = region.deforestationAlerts.filter(
      (alert: any) => new Date(alert.detectedDate) >= thirtyDaysAgo
    ).length;

    // Calculate accessibility (simplified - would use road network data)
    const accessibility = this.calculateAccessibility(region);

    return {
      historicalAlerts: region._count.deforestationAlerts,
      recentAlerts,
      populationDensity: region.population
        ? region.population / region.areaHectares
        : 0,
      accessibility,
      protectionStatus: region.protectionStatus,
      vegetationType: region.vegetationType,
      elevation: region.elevation,
      slope: null, // Would be calculated from DEM
    };
  }

  /**
   * Calculate risk score from factors
   */
  private calculateRiskScore(factors: RiskFactors): number {
    // Weighted combination of factors
    const weights = {
      historical: 0.25,
      recent: 0.35,
      accessibility: 0.2,
      protection: 0.1,
      population: 0.1,
    };

    // Normalize historical alerts (0-1 scale, assuming max 100 alerts)
    const historicalScore = Math.min(1, factors.historicalAlerts / 100);

    // Normalize recent alerts (0-1 scale, assuming max 20 alerts)
    const recentScore = Math.min(1, factors.recentAlerts / 20);

    // Accessibility (higher = more risk)
    const accessibilityScore = factors.accessibility;

    // Protection status (lower protection = higher risk)
    const protectionScores: Record<string, number> = {
      STRICTLY_PROTECTED: 0.1,
      PROTECTED: 0.3,
      COMMUNITY_MANAGED: 0.6,
      BUFFER_ZONE: 0.8,
    };
    const protectionScore = protectionScores[factors.protectionStatus] || 0.5;

    // Population density (higher = more risk, normalized)
    const populationScore = Math.min(1, factors.populationDensity / 10);

    // Calculate weighted risk score
    const riskScore =
      historicalScore * weights.historical +
      recentScore * weights.recent +
      accessibilityScore * weights.accessibility +
      protectionScore * weights.protection +
      populationScore * weights.population;

    return Math.min(1, Math.max(0, riskScore));
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(riskScore: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (riskScore >= 0.8) return "CRITICAL";
    if (riskScore >= 0.6) return "HIGH";
    if (riskScore >= 0.4) return "MEDIUM";
    return "LOW";
  }

  /**
   * Predict number of alerts in next 30 days
   */
  private predictAlertCount(factors: RiskFactors, riskScore: number): number {
    // Simple linear prediction based on recent alerts and risk score
    const baseRate = factors.recentAlerts; // Alerts in last 30 days
    const riskMultiplier = 1 + riskScore; // 1-2x multiplier

    return Math.round(baseRate * riskMultiplier);
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(factors: RiskFactors): number {
    // Higher confidence with more historical data
    const dataConfidence = Math.min(1, factors.historicalAlerts / 50);

    // Higher confidence with recent activity
    const recencyConfidence = Math.min(1, factors.recentAlerts / 10);

    return (dataConfidence + recencyConfidence) / 2;
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibility(region: any): number {
    // Simplified - would use road network, distance to settlements, etc.
    // For now, use district as proxy
    const accessibleDistricts = ["Bombali", "Port Loko"];
    return accessibleDistricts.includes(region.district) ? 0.7 : 0.3;
  }

  /**
   * Calculate historical factor score
   */
  private calculateHistoricalFactor(factors: RiskFactors): number {
    return Math.min(1, factors.historicalAlerts / 100);
  }

  /**
   * Calculate recent factor score
   */
  private calculateRecentFactor(factors: RiskFactors): number {
    return Math.min(1, factors.recentAlerts / 20);
  }

  /**
   * Calculate environmental factor score
   */
  private calculateEnvironmentalFactor(factors: RiskFactors): number {
    // Based on vegetation type, elevation, etc.
    const protectionScores: Record<string, number> = {
      STRICTLY_PROTECTED: 0.1,
      PROTECTED: 0.3,
      COMMUNITY_MANAGED: 0.6,
      BUFFER_ZONE: 0.8,
    };
    return protectionScores[factors.protectionStatus] || 0.5;
  }

  /**
   * Calculate social factor score
   */
  private calculateSocialFactor(factors: RiskFactors): number {
    // Based on population density and accessibility
    const popScore = Math.min(1, factors.populationDensity / 10);
    return (popScore + factors.accessibility) / 2;
  }
}

// Export singleton instance
export const riskPredictor = new RiskPredictor();
