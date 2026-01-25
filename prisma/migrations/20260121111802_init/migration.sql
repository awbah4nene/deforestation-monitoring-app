-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GOVERNMENT_OFFICIAL', 'FIELD_OFFICER', 'STAKEHOLDER', 'VIEWER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('GOVERNMENT', 'NGO', 'COMMUNITY', 'PRIVATE', 'DONOR', 'ACADEMIC');

-- CreateEnum
CREATE TYPE "VegetationType" AS ENUM ('TROPICAL_RAINFOREST', 'MANGROVE', 'SAVANNAH', 'MONTANE_FOREST', 'SECONDARY_FOREST', 'PLANTATION', 'MIXED_FOREST');

-- CreateEnum
CREATE TYPE "ProtectionStatus" AS ENUM ('PROTECTED_AREA', 'COMMUNITY_FOREST', 'CONCESSION', 'UNPROTECTED', 'CONSERVATION_AREA', 'NATIONAL_PARK');

-- CreateEnum
CREATE TYPE "SatelliteSource" AS ENUM ('LANDSAT_8', 'LANDSAT_9', 'SENTINEL_2', 'SENTINEL_1', 'MODIS', 'PLANET_SCOPE', 'CUSTOM_DRONE', 'AERIAL_PHOTO');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'VERIFIED', 'FALSE_ALARM', 'ACTION_TAKEN', 'RESOLVED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'ACTION_PLANNED', 'ACTION_TAKEN', 'CLOSED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ALERT_VERIFICATION', 'ROUTINE_MONITORING', 'INCIDENT_REPORT', 'BIODIVERSITY_SURVEY', 'ENFORCEMENT_ACTION', 'RESTORATION_PROGRESS');

-- CreateEnum
CREATE TYPE "DeforestationCause" AS ENUM ('AGRICULTURAL_EXPANSION', 'LOGGING', 'MINING', 'INFRASTRUCTURE', 'WILDFIRE', 'CHARCOAL_PRODUCTION', 'ENCROACHMENT', 'NATURAL', 'ILLEGAL_SETTLEMENT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SpeciesType" AS ENUM ('TREE', 'BIRD', 'MAMMAL', 'REPTILE', 'AMPHIBIAN', 'INSECT', 'PLANT', 'FUNGI', 'FISH', 'OTHER');

-- CreateEnum
CREATE TYPE "PolicyCategory" AS ENUM ('CONSERVATION', 'LAND_USE', 'LOGGING', 'MINING', 'COMMUNITY_RIGHTS', 'CARBON_CREDITS', 'ENVIRONMENTAL_PROTECTION', 'WILDLIFE_PROTECTION');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('GOVERNMENT_AGENCY', 'NGO', 'COMMUNITY_GROUP', 'PRIVATE_COMPANY', 'RESEARCH_INSTITUTION', 'DONOR_AGENCY', 'INDIVIDUAL', 'MEDIA');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('UPLOAD', 'DOWNLOAD', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('ALERT_MAP', 'DEFORESTATION_TIMELINE', 'REGION_STATS', 'RECENT_REPORTS', 'BIODIVERSITY_INDEX', 'CARBON_STOCK', 'SATELLITE_COVERAGE', 'ACTIVITY_FEED', 'ALERT_SEVERITY_CHART', 'REGION_COMPARISON', 'FIELD_REPORTS_CHART', 'ML_PREDICTION_CHART');

-- CreateEnum
CREATE TYPE "MLModelType" AS ENUM ('DEFORESTATION_DETECTION', 'VEGETATION_CLASSIFICATION', 'BIOMASS_ESTIMATION', 'CARBON_STOCK_PREDICTION', 'RISK_ASSESSMENT', 'ANOMALY_DETECTION');

-- CreateEnum
CREATE TYPE "MLTrainingStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportTypeEnum" AS ENUM ('DEFORESTATION_SUMMARY', 'REGION_ANALYSIS', 'ALERT_ANALYSIS', 'BIODIVERSITY_REPORT', 'CARBON_STOCK_REPORT', 'FIELD_REPORTS_SUMMARY', 'COMPLIANCE_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('ALERTS', 'FIELD_REPORTS', 'SATELLITE_IMAGES', 'BIODIVERSITY_DATA', 'ANALYTICS_DATA', 'USER_DATA', 'FULL_EXPORT');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'JSON', 'EXCEL', 'PDF', 'GEOJSON', 'SHAPEFILE');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'DOCUMENT', 'SATELLITE_IMAGE', 'VIDEO', 'AUDIO', 'GEOJSON', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT_CREATED', 'ALERT_ASSIGNED', 'ALERT_UPDATED', 'FIELD_REPORT_SUBMITTED', 'REPORT_VERIFIED', 'TRAINING_SCHEDULED', 'SYSTEM_UPDATE', 'DATA_EXPORT_READY', 'ML_PREDICTION_COMPLETE', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotifyChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "QualityStatus" AS ENUM ('PASSED', 'WARNING', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'FIELD_OFFICER',
    "phone" TEXT,
    "avatarUrl" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "title" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForestRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "chiefdom" TEXT NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "geometry" JSONB NOT NULL,
    "centroid" JSONB NOT NULL,
    "elevation" DOUBLE PRECISION,
    "vegetationType" "VegetationType" NOT NULL,
    "protectionStatus" "ProtectionStatus" NOT NULL,
    "description" TEXT,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForestRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForestPlot" (
    "id" TEXT NOT NULL,
    "plotCode" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geometry" JSONB NOT NULL,
    "sizeHectares" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "elevation" DOUBLE PRECISION,
    "slope" DOUBLE PRECISION,
    "soilType" TEXT,
    "aspect" DOUBLE PRECISION,
    "establishmentDate" TIMESTAMP(3) NOT NULL,
    "lastVisitedDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "treeCount" INTEGER,
    "canopyCover" DOUBLE PRECISION,
    "biomass" DOUBLE PRECISION,
    "carbonStock" DOUBLE PRECISION,

    CONSTRAINT "ForestPlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatelliteImage" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "source" "SatelliteSource" NOT NULL,
    "imageDate" TIMESTAMP(3) NOT NULL,
    "cloudCover" DOUBLE PRECISION NOT NULL,
    "resolution" DOUBLE PRECISION NOT NULL,
    "tileId" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "storagePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingDate" TIMESTAMP(3),
    "ndviMean" DOUBLE PRECISION,
    "ndviStd" DOUBLE PRECISION,
    "ndviMin" DOUBLE PRECISION,
    "ndviMax" DOUBLE PRECISION,
    "eviMean" DOUBLE PRECISION,
    "eviStd" DOUBLE PRECISION,
    "nbrMean" DOUBLE PRECISION,
    "fileSize" INTEGER,
    "bands" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SatelliteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeforestationAlert" (
    "id" TEXT NOT NULL,
    "alertCode" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "satelliteImageId" TEXT,
    "assignedToId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geometry" JSONB NOT NULL,
    "alertDate" TIMESTAMP(3) NOT NULL,
    "detectedDate" TIMESTAMP(3) NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "ndviChange" DOUBLE PRECISION,
    "brightnessChange" DOUBLE PRECISION,
    "texturalChange" DOUBLE PRECISION,
    "beforeImagePath" TEXT,
    "afterImagePath" TEXT,
    "verifiedDate" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "estimatedLoss" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeforestationAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldReport" (
    "id" TEXT NOT NULL,
    "reportCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "forestRegionId" TEXT NOT NULL,
    "plotId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geometry" JSONB NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "deforestationObserved" BOOLEAN NOT NULL,
    "estimatedAreaLoss" DOUBLE PRECISION,
    "cause" "DeforestationCause",
    "evidencePhotos" TEXT[],
    "notes" TEXT,
    "weather" TEXT,
    "temperature" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotMeasurement" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "measuredBy" TEXT,
    "measurementMethod" TEXT,
    "treeCount" INTEGER,
    "avgTreeHeight" DOUBLE PRECISION,
    "maxTreeHeight" DOUBLE PRECISION,
    "avgDbh" DOUBLE PRECISION,
    "maxDbh" DOUBLE PRECISION,
    "basalArea" DOUBLE PRECISION,
    "speciesCount" INTEGER,
    "canopyCover" DOUBLE PRECISION,
    "leafAreaIndex" DOUBLE PRECISION,
    "soilMoisture" DOUBLE PRECISION,
    "soilPh" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "biomass" DOUBLE PRECISION,
    "carbonStock" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlotMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiodiversityRecord" (
    "id" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "plotId" TEXT,
    "speciesName" TEXT NOT NULL,
    "scientificName" TEXT,
    "speciesType" "SpeciesType" NOT NULL,
    "count" INTEGER,
    "observationDate" TIMESTAMP(3) NOT NULL,
    "observedBy" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometry" JSONB,
    "photoPath" TEXT,
    "notes" TEXT,
    "isEndangered" BOOLEAN NOT NULL DEFAULT false,
    "iucnStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiodiversityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "PolicyCategory" NOT NULL,
    "issuingAuthority" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "documentPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "regionScope" TEXT[],
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertPolicy" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,

    CONSTRAINT "AlertPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StakeholderType" NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "district" TEXT NOT NULL,
    "chiefdom" TEXT,
    "involvement" TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholderRegion" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "StakeholderRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "trainer" TEXT NOT NULL,
    "trainerEmail" TEXT,
    "materials" TEXT[],
    "feedback" JSONB,
    "maxAttendees" INTEGER,
    "status" "TrainingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAttendance" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'REGISTERED',
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "rating" INTEGER,
    "certificatePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertComment" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT,
    "platform" "DevicePlatform" NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineSync" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "syncType" "SyncType" NOT NULL,
    "recordsSynced" INTEGER NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SyncStatus" NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "OfflineSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "widgetType" "WidgetType" NOT NULL,
    "position" JSONB NOT NULL,
    "configuration" JSONB NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" "MLModelType" NOT NULL,
    "description" TEXT,
    "modelPath" TEXT NOT NULL,
    "configPath" TEXT,
    "accuracy" DOUBLE PRECISION,
    "precision" DOUBLE PRECISION,
    "recall" DOUBLE PRECISION,
    "f1Score" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isProduction" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MLModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLTraining" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL,
    "status" "MLTrainingStatus" NOT NULL DEFAULT 'PENDING',
    "datasetSize" INTEGER NOT NULL,
    "epochs" INTEGER,
    "batchSize" INTEGER,
    "learningRate" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "loss" DOUBLE PRECISION,
    "validationLoss" DOUBLE PRECISION,
    "trainingTime" INTEGER,
    "errorMessage" TEXT,
    "logPath" TEXT,
    "metrics" JSONB,
    "trainedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MLTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLTrainingData" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "satelliteImageId" TEXT,
    "label" TEXT NOT NULL,
    "boundingBox" JSONB,
    "metadata" JSONB,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLTrainingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLPrediction" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "forestRegionId" TEXT NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "inputImagePath" TEXT,
    "outputImagePath" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "reportType" "ReportTypeEnum" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "regionIds" TEXT[],
    "filters" JSONB,
    "data" JSONB NOT NULL,
    "chartConfigs" JSONB,
    "generatedBy" TEXT,
    "filePath" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exportType" "ExportType" NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "filePath" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "format" "ExportFormat" NOT NULL,
    "filters" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "uploadedBy" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "alertId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regionIds" TEXT[],
    "minSeverity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "channels" "NotifyChannel"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarlyWarningConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "regionIds" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "areaThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "checkFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "notificationEmails" TEXT[],
    "autoAssign" BOOLEAN NOT NULL DEFAULT false,
    "autoAssignRole" "UserRole",
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarlyWarningConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataQualityCheck" (
    "id" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "QualityStatus" NOT NULL,
    "score" DOUBLE PRECISION,
    "issues" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataQualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnforcementCase" (
    "id" TEXT NOT NULL,
    "caseCode" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "summary" TEXT,
    "actionsTaken" JSONB,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnforcementCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Department_organizationId_idx" ON "Department"("organizationId");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE INDEX "Membership_departmentId_idx" ON "Membership"("departmentId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permissionId_key" ON "RolePermission"("role", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ForestRegion_regionCode_key" ON "ForestRegion"("regionCode");

-- CreateIndex
CREATE INDEX "ForestRegion_district_idx" ON "ForestRegion"("district");

-- CreateIndex
CREATE INDEX "ForestRegion_chiefdom_idx" ON "ForestRegion"("chiefdom");

-- CreateIndex
CREATE INDEX "ForestRegion_vegetationType_idx" ON "ForestRegion"("vegetationType");

-- CreateIndex
CREATE INDEX "ForestRegion_protectionStatus_idx" ON "ForestRegion"("protectionStatus");

-- CreateIndex
CREATE INDEX "ForestRegion_name_idx" ON "ForestRegion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ForestPlot_plotCode_key" ON "ForestPlot"("plotCode");

-- CreateIndex
CREATE INDEX "ForestPlot_forestRegionId_idx" ON "ForestPlot"("forestRegionId");

-- CreateIndex
CREATE INDEX "ForestPlot_plotCode_idx" ON "ForestPlot"("plotCode");

-- CreateIndex
CREATE INDEX "ForestPlot_latitude_longitude_idx" ON "ForestPlot"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "ForestPlot_isActive_idx" ON "ForestPlot"("isActive");

-- CreateIndex
CREATE INDEX "SatelliteImage_forestRegionId_idx" ON "SatelliteImage"("forestRegionId");

-- CreateIndex
CREATE INDEX "SatelliteImage_imageDate_idx" ON "SatelliteImage"("imageDate");

-- CreateIndex
CREATE INDEX "SatelliteImage_source_idx" ON "SatelliteImage"("source");

-- CreateIndex
CREATE INDEX "SatelliteImage_processed_idx" ON "SatelliteImage"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "DeforestationAlert_alertCode_key" ON "DeforestationAlert"("alertCode");

-- CreateIndex
CREATE INDEX "DeforestationAlert_forestRegionId_idx" ON "DeforestationAlert"("forestRegionId");

-- CreateIndex
CREATE INDEX "DeforestationAlert_alertDate_idx" ON "DeforestationAlert"("alertDate");

-- CreateIndex
CREATE INDEX "DeforestationAlert_severity_idx" ON "DeforestationAlert"("severity");

-- CreateIndex
CREATE INDEX "DeforestationAlert_status_idx" ON "DeforestationAlert"("status");

-- CreateIndex
CREATE INDEX "DeforestationAlert_assignedToId_idx" ON "DeforestationAlert"("assignedToId");

-- CreateIndex
CREATE INDEX "DeforestationAlert_confidence_idx" ON "DeforestationAlert"("confidence");

-- CreateIndex
CREATE INDEX "DeforestationAlert_priority_idx" ON "DeforestationAlert"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "FieldReport_reportCode_key" ON "FieldReport"("reportCode");

-- CreateIndex
CREATE INDEX "FieldReport_userId_idx" ON "FieldReport"("userId");

-- CreateIndex
CREATE INDEX "FieldReport_alertId_idx" ON "FieldReport"("alertId");

-- CreateIndex
CREATE INDEX "FieldReport_reportDate_idx" ON "FieldReport"("reportDate");

-- CreateIndex
CREATE INDEX "FieldReport_reportType_idx" ON "FieldReport"("reportType");

-- CreateIndex
CREATE INDEX "FieldReport_forestRegionId_idx" ON "FieldReport"("forestRegionId");

-- CreateIndex
CREATE INDEX "FieldReport_plotId_idx" ON "FieldReport"("plotId");

-- CreateIndex
CREATE INDEX "PlotMeasurement_plotId_idx" ON "PlotMeasurement"("plotId");

-- CreateIndex
CREATE INDEX "PlotMeasurement_measurementDate_idx" ON "PlotMeasurement"("measurementDate");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_forestRegionId_idx" ON "BiodiversityRecord"("forestRegionId");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_speciesType_idx" ON "BiodiversityRecord"("speciesType");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_observationDate_idx" ON "BiodiversityRecord"("observationDate");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_speciesName_idx" ON "BiodiversityRecord"("speciesName");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_plotId_idx" ON "BiodiversityRecord"("plotId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyCode_key" ON "Policy"("policyCode");

-- CreateIndex
CREATE INDEX "Policy_category_idx" ON "Policy"("category");

-- CreateIndex
CREATE INDEX "Policy_effectiveDate_idx" ON "Policy"("effectiveDate");

-- CreateIndex
CREATE INDEX "Policy_isActive_idx" ON "Policy"("isActive");

-- CreateIndex
CREATE INDEX "AlertPolicy_policyId_idx" ON "AlertPolicy"("policyId");

-- CreateIndex
CREATE INDEX "AlertPolicy_alertId_idx" ON "AlertPolicy"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertPolicy_alertId_policyId_key" ON "AlertPolicy"("alertId", "policyId");

-- CreateIndex
CREATE INDEX "Stakeholder_type_idx" ON "Stakeholder"("type");

-- CreateIndex
CREATE INDEX "Stakeholder_district_idx" ON "Stakeholder"("district");

-- CreateIndex
CREATE INDEX "Stakeholder_isActive_idx" ON "Stakeholder"("isActive");

-- CreateIndex
CREATE INDEX "Stakeholder_name_idx" ON "Stakeholder"("name");

-- CreateIndex
CREATE INDEX "StakeholderRegion_forestRegionId_idx" ON "StakeholderRegion"("forestRegionId");

-- CreateIndex
CREATE INDEX "StakeholderRegion_stakeholderId_idx" ON "StakeholderRegion"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "StakeholderRegion_stakeholderId_forestRegionId_key" ON "StakeholderRegion"("stakeholderId", "forestRegionId");

-- CreateIndex
CREATE INDEX "Training_trainingDate_idx" ON "Training"("trainingDate");

-- CreateIndex
CREATE INDEX "Training_status_idx" ON "Training"("status");

-- CreateIndex
CREATE INDEX "TrainingAttendance_trainingId_idx" ON "TrainingAttendance"("trainingId");

-- CreateIndex
CREATE INDEX "TrainingAttendance_userId_idx" ON "TrainingAttendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAttendance_trainingId_userId_key" ON "TrainingAttendance"("trainingId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AlertComment_alertId_idx" ON "AlertComment"("alertId");

-- CreateIndex
CREATE INDEX "AlertComment_createdAt_idx" ON "AlertComment"("createdAt");

-- CreateIndex
CREATE INDEX "AlertComment_userId_idx" ON "AlertComment"("userId");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_deviceId_key" ON "Device"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "OfflineSync_userId_idx" ON "OfflineSync"("userId");

-- CreateIndex
CREATE INDEX "OfflineSync_syncDate_idx" ON "OfflineSync"("syncDate");

-- CreateIndex
CREATE INDEX "OfflineSync_status_idx" ON "OfflineSync"("status");

-- CreateIndex
CREATE INDEX "DashboardWidget_userId_idx" ON "DashboardWidget"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "otps_email_purpose_idx" ON "otps"("email", "purpose");

-- CreateIndex
CREATE INDEX "otps_code_idx" ON "otps"("code");

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

-- CreateIndex
CREATE INDEX "MLModel_isActive_idx" ON "MLModel"("isActive");

-- CreateIndex
CREATE INDEX "MLModel_isProduction_idx" ON "MLModel"("isProduction");

-- CreateIndex
CREATE UNIQUE INDEX "MLModel_name_version_key" ON "MLModel"("name", "version");

-- CreateIndex
CREATE INDEX "MLTraining_modelId_idx" ON "MLTraining"("modelId");

-- CreateIndex
CREATE INDEX "MLTraining_trainingDate_idx" ON "MLTraining"("trainingDate");

-- CreateIndex
CREATE INDEX "MLTraining_status_idx" ON "MLTraining"("status");

-- CreateIndex
CREATE INDEX "MLTrainingData_trainingId_idx" ON "MLTrainingData"("trainingId");

-- CreateIndex
CREATE INDEX "MLTrainingData_satelliteImageId_idx" ON "MLTrainingData"("satelliteImageId");

-- CreateIndex
CREATE INDEX "MLPrediction_modelId_idx" ON "MLPrediction"("modelId");

-- CreateIndex
CREATE INDEX "MLPrediction_forestRegionId_idx" ON "MLPrediction"("forestRegionId");

-- CreateIndex
CREATE INDEX "MLPrediction_predictionDate_idx" ON "MLPrediction"("predictionDate");

-- CreateIndex
CREATE INDEX "AnalyticsReport_reportType_idx" ON "AnalyticsReport"("reportType");

-- CreateIndex
CREATE INDEX "AnalyticsReport_dateRangeStart_dateRangeEnd_idx" ON "AnalyticsReport"("dateRangeStart", "dateRangeEnd");

-- CreateIndex
CREATE INDEX "AnalyticsReport_generatedBy_idx" ON "AnalyticsReport"("generatedBy");

-- CreateIndex
CREATE INDEX "ExportJob_userId_idx" ON "ExportJob"("userId");

-- CreateIndex
CREATE INDEX "ExportJob_status_idx" ON "ExportJob"("status");

-- CreateIndex
CREATE INDEX "ExportJob_createdAt_idx" ON "ExportJob"("createdAt");

-- CreateIndex
CREATE INDEX "FileStorage_entityType_entityId_idx" ON "FileStorage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FileStorage_fileType_idx" ON "FileStorage"("fileType");

-- CreateIndex
CREATE INDEX "FileStorage_uploadedBy_idx" ON "FileStorage"("uploadedBy");

-- CreateIndex
CREATE INDEX "FileStorage_createdAt_idx" ON "FileStorage"("createdAt");

-- CreateIndex
CREATE INDEX "Attachment_entityType_entityId_idx" ON "Attachment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Attachment_fileId_idx" ON "Attachment"("fileId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "AlertSubscription_userId_idx" ON "AlertSubscription"("userId");

-- CreateIndex
CREATE INDEX "AlertSubscription_isActive_idx" ON "AlertSubscription"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfiguration_key_key" ON "SystemConfiguration"("key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_category_idx" ON "SystemConfiguration"("category");

-- CreateIndex
CREATE INDEX "EarlyWarningConfig_enabled_idx" ON "EarlyWarningConfig"("enabled");

-- CreateIndex
CREATE INDEX "DataQualityCheck_entityType_entityId_idx" ON "DataQualityCheck"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DataQualityCheck_status_idx" ON "DataQualityCheck"("status");

-- CreateIndex
CREATE INDEX "DataQualityCheck_resolved_idx" ON "DataQualityCheck"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "EnforcementCase_caseCode_key" ON "EnforcementCase"("caseCode");

-- CreateIndex
CREATE INDEX "EnforcementCase_alertId_idx" ON "EnforcementCase"("alertId");

-- CreateIndex
CREATE INDEX "EnforcementCase_status_idx" ON "EnforcementCase"("status");

-- CreateIndex
CREATE INDEX "EnforcementCase_assignedToId_idx" ON "EnforcementCase"("assignedToId");

-- CreateIndex
CREATE INDEX "EnforcementCase_priority_idx" ON "EnforcementCase"("priority");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForestPlot" ADD CONSTRAINT "ForestPlot_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SatelliteImage" ADD CONSTRAINT "SatelliteImage_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeforestationAlert" ADD CONSTRAINT "DeforestationAlert_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeforestationAlert" ADD CONSTRAINT "DeforestationAlert_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeforestationAlert" ADD CONSTRAINT "DeforestationAlert_satelliteImageId_fkey" FOREIGN KEY ("satelliteImageId") REFERENCES "SatelliteImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldReport" ADD CONSTRAINT "FieldReport_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldReport" ADD CONSTRAINT "FieldReport_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldReport" ADD CONSTRAINT "FieldReport_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "ForestPlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldReport" ADD CONSTRAINT "FieldReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotMeasurement" ADD CONSTRAINT "PlotMeasurement_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "ForestPlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiodiversityRecord" ADD CONSTRAINT "BiodiversityRecord_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiodiversityRecord" ADD CONSTRAINT "BiodiversityRecord_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "ForestPlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertPolicy" ADD CONSTRAINT "AlertPolicy_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertPolicy" ADD CONSTRAINT "AlertPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderRegion" ADD CONSTRAINT "StakeholderRegion_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderRegion" ADD CONSTRAINT "StakeholderRegion_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttendance" ADD CONSTRAINT "TrainingAttendance_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttendance" ADD CONSTRAINT "TrainingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertComment" ADD CONSTRAINT "AlertComment_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertComment" ADD CONSTRAINT "AlertComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLTraining" ADD CONSTRAINT "MLTraining_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "MLModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLTrainingData" ADD CONSTRAINT "MLTrainingData_satelliteImageId_fkey" FOREIGN KEY ("satelliteImageId") REFERENCES "SatelliteImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLTrainingData" ADD CONSTRAINT "MLTrainingData_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "MLTraining"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLPrediction" ADD CONSTRAINT "MLPrediction_forestRegionId_fkey" FOREIGN KEY ("forestRegionId") REFERENCES "ForestRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLPrediction" ADD CONSTRAINT "MLPrediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "MLModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertSubscription" ADD CONSTRAINT "AlertSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnforcementCase" ADD CONSTRAINT "EnforcementCase_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "DeforestationAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnforcementCase" ADD CONSTRAINT "EnforcementCase_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnforcementCase" ADD CONSTRAINT "EnforcementCase_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
