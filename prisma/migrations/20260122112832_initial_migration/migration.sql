-- CreateEnum
CREATE TYPE "CarbonCreditStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'ISSUED', 'TRANSFERRED', 'RETIRED');

-- CreateEnum
CREATE TYPE "EnvironmentalIndicatorType" AS ENUM ('CARBON_DIOXIDE', 'OXYGEN_PRODUCTION', 'WATER_RETENTION', 'SOIL_CONSERVATION', 'BIODIVERSITY_INDEX', 'AIR_QUALITY');

-- CreateEnum
CREATE TYPE "SoilConditionType" AS ENUM ('ERODED', 'COMPACTED', 'CONTAMINATED', 'HEALTHY', 'DEGRADED');

-- CreateEnum
CREATE TYPE "WaterSourceType" AS ENUM ('STREAM', 'RIVER', 'LAKE', 'POND', 'SPRING', 'WETLAND');

-- CreateEnum
CREATE TYPE "ProcessingPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChangeDetectionAlgorithm" AS ENUM ('NDVI_DIFFERENCE', 'RATIO_VEGETATION_INDEX', 'PCA_CHANGE_DETECTION', 'SVM_CLASSIFICATION', 'CNN_DETECTION', 'RANDOM_FOREST');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('UNVALIDATED', 'IN_REVIEW', 'VALIDATED', 'INVALID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "KpiType" AS ENUM ('FOREST_COVER', 'DEFORESTATION_RATE', 'CARBON_STORAGE', 'BIODIVERSITY_INDEX', 'PATROL_EFFICIENCY', 'ALERT_RESPONSE_TIME', 'COMPLIANCE_RATE');

-- CreateEnum
CREATE TYPE "TrendType" AS ENUM ('SEASONAL', 'ANNUAL', 'MULTI_YEAR', 'CYCLICAL', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "RiskFactorType" AS ENUM ('AGRICULTURAL_PRESSURE', 'ACCESSIBILITY', 'ECONOMIC_DRIVERS', 'GOVERNANCE_WEAKNESS', 'DEMOGRAPHIC_PRESSURE', 'CLIMATE_STRESS', 'MARKET_ACCESS', 'POLICY_GAP');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "AlertTriggerType" AS ENUM ('THRESHOLD_EXCEEDED', 'TREND_IDENTIFIED', 'ANOMALY_DETECTED', 'USER_REPORT', 'MODEL_PREDICTION');

-- CreateEnum
CREATE TYPE "PatrolStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'VIDEO', 'AUDIO', 'GPS_COORDINATES', 'MEASUREMENT', 'OBSERVATION', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('FIELD_OFFICER', 'COMMUNITY_MEMBER', 'SATELLITE_ALERT', 'DRONE_SURVEILLANCE', 'NGO_PARTNER', 'GOVERNMENT_AGENCY');

-- CreateEnum
CREATE TYPE "LegalStatus" AS ENUM ('PROPOSED', 'ENACTED', 'AMENDED', 'REPEALED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW', 'EXEMPT');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('LOGGING_PERMIT', 'LAND_USE_PERMIT', 'CONSTRUCTION_PERMIT', 'MINING_LICENSE', 'AGRICULTURAL_CLEARANCE');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('PENDING_APPLICATION', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'SUSPENDED', 'REVOKED', 'EXPIRED', 'RENEWED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('AWARENESS', 'EDUCATION', 'MOBILIZATION', 'ADVOCACY', 'FUNDRAISING');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('SUGGESTION', 'COMPLAINT', 'PRAISE', 'BUG_REPORT', 'FEATURE_REQUEST');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('WORKSHOP', 'MEETING', 'SURVEY', 'FOCUS_GROUP', 'ONLINE_POLL', 'FEEDBACK_SESSION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ISSUANCE', 'TRANSFER', 'RETIREMENT', 'CANCELLATION');

-- AlterTable
ALTER TABLE "FieldReport" ADD COLUMN     "patrolRouteId" TEXT;

-- CreateTable
CREATE TABLE "CarbonStock" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "carbonDensity" DOUBLE PRECISION NOT NULL,
    "totalCarbon" DOUBLE PRECISION NOT NULL,
    "carbonChange" DOUBLE PRECISION,
    "methodology" TEXT NOT NULL,
    "measuredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarbonCredit" (
    "id" TEXT NOT NULL,
    "creditCode" TEXT NOT NULL,
    "carbonStockId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "vintageYear" INTEGER NOT NULL,
    "status" "CarbonCreditStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "issuedDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "holder" TEXT,
    "projectDetails" TEXT,
    "verificationBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "fromHolder" TEXT,
    "toHolder" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalIndicator" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "indicatorType" "EnvironmentalIndicatorType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "baselineValue" DOUBLE PRECISION,
    "deviation" DOUBLE PRECISION,
    "source" TEXT,
    "methodology" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentalIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherStation" (
    "id" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION,
    "installationDate" TIMESTAMP(3) NOT NULL,
    "lastMaintenance" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "equipmentType" TEXT,
    "parameters" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherReading" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "readingDate" TIMESTAMP(3) NOT NULL,
    "temperatureAvg" DOUBLE PRECISION,
    "temperatureMin" DOUBLE PRECISION,
    "temperatureMax" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "windDirection" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,
    "solarRadiation" DOUBLE PRECISION,
    "evapotranspiration" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilCondition" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "plotId" TEXT,
    "conditionType" "SoilConditionType" NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "pHLevel" DOUBLE PRECISION,
    "nitrogenLevel" DOUBLE PRECISION,
    "phosphorusLevel" DOUBLE PRECISION,
    "potassiumLevel" DOUBLE PRECISION,
    "organicMatter" DOUBLE PRECISION,
    "erosionLevel" DOUBLE PRECISION,
    "compactionLevel" DOUBLE PRECISION,
    "soilTexture" TEXT,
    "assessedBy" TEXT,
    "recommendations" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoilCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterBody" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "waterType" "WaterSourceType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "areaHa" DOUBLE PRECISION,
    "perimeter" DOUBLE PRECISION,
    "depthAvg" DOUBLE PRECISION,
    "ecologicalHealth" INTEGER,
    "bufferZone" DOUBLE PRECISION,
    "threats" TEXT[],
    "protectionStatus" "ProtectionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterQuality" (
    "id" TEXT NOT NULL,
    "waterBodyId" TEXT NOT NULL,
    "phLevel" DOUBLE PRECISION,
    "dissolvedOxygen" DOUBLE PRECISION,
    "turbidity" DOUBLE PRECISION,
    "nitrates" DOUBLE PRECISION,
    "phosphates" DOUBLE PRECISION,
    "bacteriaCount" INTEGER,
    "chemicalPollutants" TEXT[],
    "lastTested" TIMESTAMP(3) NOT NULL,
    "testedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterQualityReading" (
    "id" TEXT NOT NULL,
    "qualityId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "readingDate" TIMESTAMP(3) NOT NULL,
    "methodology" TEXT,
    "qualityStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterBodyId" TEXT NOT NULL,

    CONSTRAINT "WaterQualityReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageProcessingQueue" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "algorithm" "ChangeDetectionAlgorithm" NOT NULL,
    "parameters" JSONB NOT NULL,
    "priority" "ProcessingPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "ProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "outputFiles" TEXT[],
    "metadata" JSONB,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageProcessingQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeDetectionResult" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "algorithmId" TEXT,
    "detectionDate" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "changeAreaHa" DOUBLE PRECISION NOT NULL,
    "changeIntensity" DOUBLE PRECISION NOT NULL,
    "affectedVegetation" DOUBLE PRECISION,
    "coordinates" JSONB NOT NULL,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT,
    "changeMapUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeDetectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationResult" (
    "id" TEXT NOT NULL,
    "detectionResultId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "validationDate" TIMESTAMP(3) NOT NULL,
    "status" "ValidationStatus" NOT NULL,
    "accuracyScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "suggestedCorrections" JSONB,
    "reviewedBy" TEXT,
    "reviewDate" TIMESTAMP(3),
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlgorithmParameter" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "paramName" TEXT NOT NULL,
    "paramValue" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "description" TEXT,
    "isTunable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgorithmParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelPerformance" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "testDatasetId" TEXT,
    "evaluationDate" TIMESTAMP(3) NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "precision" DOUBLE PRECISION NOT NULL,
    "recall" DOUBLE PRECISION NOT NULL,
    "f1Score" DOUBLE PRECISION NOT NULL,
    "aucScore" DOUBLE PRECISION,
    "kappaStatistic" DOUBLE PRECISION,
    "confusionMatrix" JSONB,
    "metrics" JSONB,
    "evaluatedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionValidation" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "validationDate" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "correction" JSONB,
    "reviewedBy" TEXT,
    "reviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelEnsemble" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelIds" TEXT[],
    "weights" JSONB,
    "combinationMethod" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelEnsemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiTracking" (
    "id" TEXT NOT NULL,
    "kpiType" "KpiType" NOT NULL,
    "regionId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "calculationMethod" TEXT NOT NULL,
    "dataSource" TEXT[],
    "confidence" DOUBLE PRECISION,
    "trendDirection" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendAnalysis" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "trendType" "TrendType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trendStrength" DOUBLE PRECISION NOT NULL,
    "trendDirection" TEXT NOT NULL,
    "significance" DOUBLE PRECISION NOT NULL,
    "pValue" DOUBLE PRECISION,
    "rSquared" DOUBLE PRECISION,
    "slope" DOUBLE PRECISION NOT NULL,
    "intercept" DOUBLE PRECISION NOT NULL,
    "forecastFuture" JSONB,
    "influencingFactors" TEXT[],
    "analysisMethod" TEXT NOT NULL,
    "analyst" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFactor" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "factorType" "RiskFactorType" NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "contributingFactors" JSONB,
    "mitigationMeasures" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotspotPrediction" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "predictedRisk" "RiskLevel" NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "riskFactors" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "predictionModel" TEXT,
    "validityPeriod" TIMESTAMP(3) NOT NULL,
    "preventiveActions" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "assignedTo" TEXT,
    "completedDate" TIMESTAMP(3),
    "effectiveness" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotspotPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThresholdConfiguration" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "regionId" TEXT,
    "parameter" TEXT NOT NULL,
    "comparisonOperator" TEXT NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertSeverity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "notificationChannels" "NotifyChannel"[],
    "escalationRules" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThresholdConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrolRoute" (
    "id" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "assignedTo" TEXT[],
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "PatrolStatus" NOT NULL DEFAULT 'PLANNED',
    "routeGeometry" JSONB NOT NULL,
    "distance" DOUBLE PRECISION,
    "estimatedDuration" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "objectives" TEXT[],
    "equipmentNeeded" TEXT[],
    "safetyNotes" TEXT,
    "completedBy" TEXT,
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatrolRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceCollection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "alertId" TEXT,
    "collectedDate" TIMESTAMP(3) NOT NULL,
    "collectorId" TEXT NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "description" TEXT NOT NULL,
    "filePaths" TEXT[],
    "coordinates" JSONB,
    "accuracy" DOUBLE PRECISION,
    "metadata" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "qualityScore" INTEGER,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterContact" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "reportType" "ReportSource" NOT NULL,
    "location" JSONB NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "evidencePhotos" TEXT[],
    "urgency" INTEGER NOT NULL DEFAULT 5,
    "sourceDetails" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "relatedAlertId" TEXT,
    "relatedReportId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forestRegionId" TEXT NOT NULL,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalFramework" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "legalType" TEXT NOT NULL,
    "status" "LegalStatus" NOT NULL DEFAULT 'ENACTED',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "applicableRegions" TEXT[],
    "enforcementAgency" TEXT,
    "penalties" JSONB,
    "amendments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "relatedLaws" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceAudit" (
    "id" TEXT NOT NULL,
    "auditCode" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "auditorId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "findings" JSONB,
    "complianceStatus" "ComplianceStatus" NOT NULL,
    "recommendations" TEXT[],
    "correctiveActions" JSONB[],
    "deadline" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "followUpAudits" TEXT[],
    "reportFile" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permit" (
    "id" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "permitType" "PermitType" NOT NULL,
    "regionId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantContact" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "PermitStatus" NOT NULL DEFAULT 'PENDING_APPLICATION',
    "issuedBy" TEXT,
    "conditions" TEXT[],
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "approvedActivities" TEXT[],
    "environmentalSafeguards" JSONB[],
    "monitoringRequirements" JSONB[],
    "applicationDocuments" TEXT[],
    "denialReason" TEXT,
    "renewalHistory" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityEngagement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "organizerId" TEXT NOT NULL,
    "participants" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "location" TEXT NOT NULL,
    "objectives" TEXT[],
    "attendanceCount" INTEGER NOT NULL,
    "outcomes" JSONB,
    "feedback" TEXT[],
    "photos" TEXT[],
    "documents" TEXT[],
    "followUps" JSONB[],
    "impactAssessment" JSONB,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwarenessCampaign" (
    "id" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "campaignType" "CampaignType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PLANNING',
    "targetAudience" TEXT[],
    "regions" TEXT[],
    "objectives" TEXT[],
    "activities" JSONB[],
    "budget" DOUBLE PRECISION,
    "spentAmount" DOUBLE PRECISION,
    "reach" INTEGER NOT NULL,
    "engagementRate" DOUBLE PRECISION,
    "materials" TEXT[],
    "partners" TEXT[],
    "outcomes" JSONB,
    "challenges" TEXT[],
    "lessonsLearned" TEXT[],
    "coordinatorId" TEXT,
    "evaluation" JSONB,
    "reports" TEXT[],
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwarenessCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL,
    "submitterContact" TEXT,
    "feedbackType" "FeedbackType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedDate" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "rating" INTEGER,
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "relatedEntity" TEXT,
    "relatedEntityType" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModelEnsemblePredictions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModelEnsemblePredictions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PermitViolations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermitViolations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PatrolAssignedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PatrolAssignedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PermitComplianceAudits" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermitComplianceAudits_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CommunityEngagementParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityEngagementParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CarbonStock_forestRegionId_idx" ON "CarbonStock"("forestRegionId");

-- CreateIndex
CREATE INDEX "CarbonStock_measurementDate_idx" ON "CarbonStock"("measurementDate");

-- CreateIndex
CREATE UNIQUE INDEX "CarbonCredit_creditCode_key" ON "CarbonCredit"("creditCode");

-- CreateIndex
CREATE INDEX "CarbonCredit_carbonStockId_idx" ON "CarbonCredit"("carbonStockId");

-- CreateIndex
CREATE INDEX "CarbonCredit_status_idx" ON "CarbonCredit"("status");

-- CreateIndex
CREATE INDEX "CarbonCredit_vintageYear_idx" ON "CarbonCredit"("vintageYear");

-- CreateIndex
CREATE INDEX "CreditTransaction_creditId_idx" ON "CreditTransaction"("creditId");

-- CreateIndex
CREATE INDEX "CreditTransaction_transactionDate_idx" ON "CreditTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "EnvironmentalIndicator_forestRegionId_idx" ON "EnvironmentalIndicator"("forestRegionId");

-- CreateIndex
CREATE INDEX "EnvironmentalIndicator_indicatorType_idx" ON "EnvironmentalIndicator"("indicatorType");

-- CreateIndex
CREATE INDEX "EnvironmentalIndicator_measurementDate_idx" ON "EnvironmentalIndicator"("measurementDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherStation_stationCode_key" ON "WeatherStation"("stationCode");

-- CreateIndex
CREATE INDEX "WeatherStation_forestRegionId_idx" ON "WeatherStation"("forestRegionId");

-- CreateIndex
CREATE INDEX "WeatherStation_isActive_idx" ON "WeatherStation"("isActive");

-- CreateIndex
CREATE INDEX "WeatherReading_stationId_idx" ON "WeatherReading"("stationId");

-- CreateIndex
CREATE INDEX "WeatherReading_readingDate_idx" ON "WeatherReading"("readingDate");

-- CreateIndex
CREATE INDEX "SoilCondition_forestRegionId_idx" ON "SoilCondition"("forestRegionId");

-- CreateIndex
CREATE INDEX "SoilCondition_conditionType_idx" ON "SoilCondition"("conditionType");

-- CreateIndex
CREATE INDEX "SoilCondition_assessmentDate_idx" ON "SoilCondition"("assessmentDate");

-- CreateIndex
CREATE INDEX "WaterBody_forestRegionId_idx" ON "WaterBody"("forestRegionId");

-- CreateIndex
CREATE INDEX "WaterBody_waterType_idx" ON "WaterBody"("waterType");

-- CreateIndex
CREATE INDEX "WaterBody_protectionStatus_idx" ON "WaterBody"("protectionStatus");

-- CreateIndex
CREATE INDEX "WaterQuality_lastTested_idx" ON "WaterQuality"("lastTested");

-- CreateIndex
CREATE UNIQUE INDEX "WaterQuality_waterBodyId_key" ON "WaterQuality"("waterBodyId");

-- CreateIndex
CREATE INDEX "WaterQualityReading_qualityId_idx" ON "WaterQualityReading"("qualityId");

-- CreateIndex
CREATE INDEX "WaterQualityReading_parameter_idx" ON "WaterQualityReading"("parameter");

-- CreateIndex
CREATE INDEX "WaterQualityReading_readingDate_idx" ON "WaterQualityReading"("readingDate");

-- CreateIndex
CREATE INDEX "WaterQualityReading_waterBodyId_idx" ON "WaterQualityReading"("waterBodyId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageProcessingQueue_taskId_key" ON "ImageProcessingQueue"("taskId");

-- CreateIndex
CREATE INDEX "ImageProcessingQueue_imageId_idx" ON "ImageProcessingQueue"("imageId");

-- CreateIndex
CREATE INDEX "ImageProcessingQueue_status_idx" ON "ImageProcessingQueue"("status");

-- CreateIndex
CREATE INDEX "ImageProcessingQueue_priority_idx" ON "ImageProcessingQueue"("priority");

-- CreateIndex
CREATE INDEX "ImageProcessingQueue_queuedAt_idx" ON "ImageProcessingQueue"("queuedAt");

-- CreateIndex
CREATE INDEX "ChangeDetectionResult_imageId_idx" ON "ChangeDetectionResult"("imageId");

-- CreateIndex
CREATE INDEX "ChangeDetectionResult_detectionDate_idx" ON "ChangeDetectionResult"("detectionDate");

-- CreateIndex
CREATE INDEX "ChangeDetectionResult_confidence_idx" ON "ChangeDetectionResult"("confidence");

-- CreateIndex
CREATE INDEX "ValidationResult_validationDate_idx" ON "ValidationResult"("validationDate");

-- CreateIndex
CREATE INDEX "ValidationResult_status_idx" ON "ValidationResult"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationResult_detectionResultId_validatorId_key" ON "ValidationResult"("detectionResultId", "validatorId");

-- CreateIndex
CREATE INDEX "AlgorithmParameter_modelId_idx" ON "AlgorithmParameter"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "AlgorithmParameter_modelId_paramName_key" ON "AlgorithmParameter"("modelId", "paramName");

-- CreateIndex
CREATE INDEX "ModelPerformance_modelId_idx" ON "ModelPerformance"("modelId");

-- CreateIndex
CREATE INDEX "ModelPerformance_evaluationDate_idx" ON "ModelPerformance"("evaluationDate");

-- CreateIndex
CREATE INDEX "PredictionValidation_validationDate_idx" ON "PredictionValidation"("validationDate");

-- CreateIndex
CREATE INDEX "PredictionValidation_isValid_idx" ON "PredictionValidation"("isValid");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionValidation_predictionId_validatorId_key" ON "PredictionValidation"("predictionId", "validatorId");

-- CreateIndex
CREATE INDEX "ModelEnsemble_isActive_idx" ON "ModelEnsemble"("isActive");

-- CreateIndex
CREATE INDEX "KpiTracking_kpiType_idx" ON "KpiTracking"("kpiType");

-- CreateIndex
CREATE INDEX "KpiTracking_regionId_idx" ON "KpiTracking"("regionId");

-- CreateIndex
CREATE INDEX "KpiTracking_periodStart_periodEnd_idx" ON "KpiTracking"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "TrendAnalysis_kpiId_idx" ON "TrendAnalysis"("kpiId");

-- CreateIndex
CREATE INDEX "TrendAnalysis_trendType_idx" ON "TrendAnalysis"("trendType");

-- CreateIndex
CREATE INDEX "TrendAnalysis_startDate_endDate_idx" ON "TrendAnalysis"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "RiskFactor_regionId_idx" ON "RiskFactor"("regionId");

-- CreateIndex
CREATE INDEX "RiskFactor_factorType_idx" ON "RiskFactor"("factorType");

-- CreateIndex
CREATE INDEX "RiskFactor_riskLevel_idx" ON "RiskFactor"("riskLevel");

-- CreateIndex
CREATE INDEX "RiskFactor_assessmentDate_idx" ON "RiskFactor"("assessmentDate");

-- CreateIndex
CREATE INDEX "HotspotPrediction_regionId_idx" ON "HotspotPrediction"("regionId");

-- CreateIndex
CREATE INDEX "HotspotPrediction_predictedRisk_idx" ON "HotspotPrediction"("predictedRisk");

-- CreateIndex
CREATE INDEX "HotspotPrediction_predictionDate_idx" ON "HotspotPrediction"("predictionDate");

-- CreateIndex
CREATE INDEX "HotspotPrediction_status_idx" ON "HotspotPrediction"("status");

-- CreateIndex
CREATE INDEX "HotspotPrediction_priority_idx" ON "HotspotPrediction"("priority");

-- CreateIndex
CREATE INDEX "ThresholdConfiguration_alertType_idx" ON "ThresholdConfiguration"("alertType");

-- CreateIndex
CREATE INDEX "ThresholdConfiguration_regionId_idx" ON "ThresholdConfiguration"("regionId");

-- CreateIndex
CREATE INDEX "ThresholdConfiguration_isActive_idx" ON "ThresholdConfiguration"("isActive");

-- CreateIndex
CREATE INDEX "PatrolRoute_regionId_idx" ON "PatrolRoute"("regionId");

-- CreateIndex
CREATE INDEX "PatrolRoute_status_idx" ON "PatrolRoute"("status");

-- CreateIndex
CREATE INDEX "PatrolRoute_plannedDate_idx" ON "PatrolRoute"("plannedDate");

-- CreateIndex
CREATE INDEX "PatrolRoute_priority_idx" ON "PatrolRoute"("priority");

-- CreateIndex
CREATE INDEX "EvidenceCollection_collectorId_idx" ON "EvidenceCollection"("collectorId");

-- CreateIndex
CREATE INDEX "EvidenceCollection_evidenceType_idx" ON "EvidenceCollection"("evidenceType");

-- CreateIndex
CREATE INDEX "EvidenceCollection_collectedDate_idx" ON "EvidenceCollection"("collectedDate");

-- CreateIndex
CREATE INDEX "EvidenceCollection_verified_idx" ON "EvidenceCollection"("verified");

-- CreateIndex
CREATE INDEX "CommunityReport_reportDate_idx" ON "CommunityReport"("reportDate");

-- CreateIndex
CREATE INDEX "CommunityReport_severity_idx" ON "CommunityReport"("severity");

-- CreateIndex
CREATE INDEX "CommunityReport_status_idx" ON "CommunityReport"("status");

-- CreateIndex
CREATE INDEX "CommunityReport_verificationStatus_idx" ON "CommunityReport"("verificationStatus");

-- CreateIndex
CREATE INDEX "CommunityReport_urgency_idx" ON "CommunityReport"("urgency");

-- CreateIndex
CREATE INDEX "CommunityReport_forestRegionId_idx" ON "CommunityReport"("forestRegionId");

-- CreateIndex
CREATE INDEX "LegalFramework_jurisdiction_idx" ON "LegalFramework"("jurisdiction");

-- CreateIndex
CREATE INDEX "LegalFramework_legalType_idx" ON "LegalFramework"("legalType");

-- CreateIndex
CREATE INDEX "LegalFramework_status_idx" ON "LegalFramework"("status");

-- CreateIndex
CREATE INDEX "LegalFramework_effectiveDate_idx" ON "LegalFramework"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceAudit_auditCode_key" ON "ComplianceAudit"("auditCode");

-- CreateIndex
CREATE INDEX "ComplianceAudit_regionId_idx" ON "ComplianceAudit"("regionId");

-- CreateIndex
CREATE INDEX "ComplianceAudit_auditDate_idx" ON "ComplianceAudit"("auditDate");

-- CreateIndex
CREATE INDEX "ComplianceAudit_complianceStatus_idx" ON "ComplianceAudit"("complianceStatus");

-- CreateIndex
CREATE INDEX "ComplianceAudit_auditorId_idx" ON "ComplianceAudit"("auditorId");

-- CreateIndex
CREATE UNIQUE INDEX "Permit_permitNumber_key" ON "Permit"("permitNumber");

-- CreateIndex
CREATE INDEX "Permit_permitType_idx" ON "Permit"("permitType");

-- CreateIndex
CREATE INDEX "Permit_regionId_idx" ON "Permit"("regionId");

-- CreateIndex
CREATE INDEX "Permit_status_idx" ON "Permit"("status");

-- CreateIndex
CREATE INDEX "Permit_expiryDate_idx" ON "Permit"("expiryDate");

-- CreateIndex
CREATE INDEX "Permit_issuedDate_idx" ON "Permit"("issuedDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityEngagement_eventId_key" ON "CommunityEngagement"("eventId");

-- CreateIndex
CREATE INDEX "CommunityEngagement_regionId_idx" ON "CommunityEngagement"("regionId");

-- CreateIndex
CREATE INDEX "CommunityEngagement_engagementType_idx" ON "CommunityEngagement"("engagementType");

-- CreateIndex
CREATE INDEX "CommunityEngagement_date_idx" ON "CommunityEngagement"("date");

-- CreateIndex
CREATE INDEX "CommunityEngagement_organizerId_idx" ON "CommunityEngagement"("organizerId");

-- CreateIndex
CREATE INDEX "AwarenessCampaign_campaignType_idx" ON "AwarenessCampaign"("campaignType");

-- CreateIndex
CREATE INDEX "AwarenessCampaign_status_idx" ON "AwarenessCampaign"("status");

-- CreateIndex
CREATE INDEX "AwarenessCampaign_startDate_endDate_idx" ON "AwarenessCampaign"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Feedback_feedbackType_idx" ON "Feedback"("feedbackType");

-- CreateIndex
CREATE INDEX "Feedback_submittedDate_idx" ON "Feedback"("submittedDate");

-- CreateIndex
CREATE INDEX "Feedback_resolved_idx" ON "Feedback"("resolved");

-- CreateIndex
CREATE INDEX "Feedback_priority_idx" ON "Feedback"("priority");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "_ModelEnsemblePredictions_B_index" ON "_ModelEnsemblePredictions"("B");

-- CreateIndex
CREATE INDEX "_PermitViolations_B_index" ON "_PermitViolations"("B");

-- CreateIndex
CREATE INDEX "_PatrolAssignedUsers_B_index" ON "_PatrolAssignedUsers"("B");

-- CreateIndex
CREATE INDEX "_PermitComplianceAudits_B_index" ON "_PermitComplianceAudits"("B");

-- CreateIndex
CREATE INDEX "_CommunityEngagementParticipants_B_index" ON "_CommunityEngagementParticipants"("B");

-- CreateIndex
CREATE INDEX "FieldReport_patrolRouteId_idx" ON "FieldReport"("patrolRouteId");

-- AddForeignKey
ALTER TABLE "FieldReport" ADD CONSTRAINT "FieldReport_patrolRouteId_fkey" FOREIGN KEY ("patrolRouteId") REFERENCES "PatrolRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonStock" ADD CONSTRAINT "CarbonStock_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonCredit" ADD CONSTRAINT "CarbonCredit_carbonStockId_fkey" FOREIGN KEY ("carbonStockId") REFERENCES "CarbonStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "CarbonCredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalIndicator" ADD CONSTRAINT "EnvironmentalIndicator_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherStation" ADD CONSTRAINT "WeatherStation_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherReading" ADD CONSTRAINT "WeatherReading_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "WeatherStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilCondition" ADD CONSTRAINT "SoilCondition_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilCondition" ADD CONSTRAINT "SoilCondition_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "ForestPlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterBody" ADD CONSTRAINT "WaterBody_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQuality" ADD CONSTRAINT "WaterQuality_waterBodyId_fkey" FOREIGN KEY ("waterBodyId") REFERENCES "WaterBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityReading" ADD CONSTRAINT "WaterQualityReading_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "WaterQuality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityReading" ADD CONSTRAINT "WaterQualityReading_waterBodyId_fkey" FOREIGN KEY ("waterBodyId") REFERENCES "WaterBody"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageProcessingQueue" ADD CONSTRAINT "ImageProcessingQueue_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "SatelliteImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeDetectionResult" ADD CONSTRAINT "ChangeDetectionResult_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "SatelliteImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeDetectionResult" ADD CONSTRAINT "ChangeDetectionResult_algorithmId_fkey" FOREIGN KEY ("algorithmId") REFERENCES "MLModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_detectionResultId_fkey" FOREIGN KEY ("detectionResultId") REFERENCES "ChangeDetectionResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlgorithmParameter" ADD CONSTRAINT "AlgorithmParameter_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "MLModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelPerformance" ADD CONSTRAINT "ModelPerformance_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "MLModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelPerformance" ADD CONSTRAINT "ModelPerformance_testDatasetId_fkey" FOREIGN KEY ("testDatasetId") REFERENCES "MLTrainingData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionValidation" ADD CONSTRAINT "PredictionValidation_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "MLPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionValidation" ADD CONSTRAINT "PredictionValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionValidation" ADD CONSTRAINT "PredictionValidation_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiTracking" ADD CONSTRAINT "KpiTracking_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendAnalysis" ADD CONSTRAINT "TrendAnalysis_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KpiTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFactor" ADD CONSTRAINT "RiskFactor_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotspotPrediction" ADD CONSTRAINT "HotspotPrediction_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotspotPrediction" ADD CONSTRAINT "HotspotPrediction_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThresholdConfiguration" ADD CONSTRAINT "ThresholdConfiguration_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrolRoute" ADD CONSTRAINT "PatrolRoute_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceCollection" ADD CONSTRAINT "EvidenceCollection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "FieldReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceCollection" ADD CONSTRAINT "EvidenceCollection_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceCollection" ADD CONSTRAINT "EvidenceCollection_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceCollection" ADD CONSTRAINT "EvidenceCollection_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_relatedAlertId_fkey" FOREIGN KEY ("relatedAlertId") REFERENCES "DeforestationAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_relatedReportId_fkey" FOREIGN KEY ("relatedReportId") REFERENCES "FieldReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceAudit" ADD CONSTRAINT "ComplianceAudit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceAudit" ADD CONSTRAINT "ComplianceAudit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityEngagement" ADD CONSTRAINT "CommunityEngagement_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityEngagement" ADD CONSTRAINT "CommunityEngagement_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwarenessCampaign" ADD CONSTRAINT "AwarenessCampaign_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelEnsemblePredictions" ADD CONSTRAINT "_ModelEnsemblePredictions_A_fkey" FOREIGN KEY ("A") REFERENCES "MLPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModelEnsemblePredictions" ADD CONSTRAINT "_ModelEnsemblePredictions_B_fkey" FOREIGN KEY ("B") REFERENCES "ModelEnsemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermitViolations" ADD CONSTRAINT "_PermitViolations_A_fkey" FOREIGN KEY ("A") REFERENCES "EnforcementCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermitViolations" ADD CONSTRAINT "_PermitViolations_B_fkey" FOREIGN KEY ("B") REFERENCES "Permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatrolAssignedUsers" ADD CONSTRAINT "_PatrolAssignedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "PatrolRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatrolAssignedUsers" ADD CONSTRAINT "_PatrolAssignedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermitComplianceAudits" ADD CONSTRAINT "_PermitComplianceAudits_A_fkey" FOREIGN KEY ("A") REFERENCES "ComplianceAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermitComplianceAudits" ADD CONSTRAINT "_PermitComplianceAudits_B_fkey" FOREIGN KEY ("B") REFERENCES "Permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityEngagementParticipants" ADD CONSTRAINT "_CommunityEngagementParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "CommunityEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityEngagementParticipants" ADD CONSTRAINT "_CommunityEngagementParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
