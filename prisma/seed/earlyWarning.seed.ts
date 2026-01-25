import {
    RiskFactorType,
    RiskLevel,
    AlertSeverity,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export async function seedEarlyWarning(prisma: PrismaClient) {
    console.log("⚠️ Seeding Early Warning System...");

    const region = await prisma.forestRegion.findFirst();
    if (!region) return;

    try {
        await prisma.riskFactor.create({
            data: {
                regionId: region.id,
                factorType: RiskFactorType.ILLEGAL_LOGGING,
                assessmentDate: new Date(),
                riskLevel: RiskLevel.HIGH,
                score: 82,
                weight: 0.4,
                mitigationMeasures: [
                    "Increase patrol frequency",
                    "Community sensitization",
                ],
                notes: "High activity detected near boundary",
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }

    try {
        await prisma.hotspotPrediction.create({
            data: {
                regionId: region.id,
                predictionDate: new Date(),
                predictedRisk: RiskLevel.HIGH,
                probability: 0.78,
                confidence: 0.85,
                validityPeriod: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                preventiveActions: [
                    "Deploy patrol team",
                    "Engage local leaders",
                ],
                priority: 9,
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }

    try {
        await prisma.thresholdConfiguration.create({
            data: {
                alertType: "DEFORESTATION",
                parameter: "tree_loss_rate",
                comparisonOperator: "GT",
                thresholdValue: 10,
                unit: "hectares/month",
                alertSeverity: AlertSeverity.HIGH,
                notificationChannels: ["EMAIL", "SMS"],
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }
}
