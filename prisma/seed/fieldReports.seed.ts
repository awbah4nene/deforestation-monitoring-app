import {
    PrismaClient,
    ReportType,
    DeforestationCause,
} from "@prisma/client";

export async function seedFieldReports(prisma: PrismaClient) {
    console.log("📝 Seeding Field Reports...");

    // Get regions, users, and alerts
    const regions = await prisma.forestRegion.findMany();
    const fieldOfficers = await prisma.user.findMany({
        where: { role: "FIELD_OFFICER" },
    });
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
    });
    const alerts = await prisma.deforestationAlert.findMany({
        take: 30, // Use first 30 alerts
    });
    const patrolRoutes = await prisma.patrolRoute.findMany({
        take: 20, // Use first 20 patrol routes
    });

    if (regions.length === 0 || fieldOfficers.length === 0) {
        console.log("⚠️ No regions or field officers found. Skipping field reports seed.");
        return;
    }

    const reports = [];
    const now = new Date();
    
    // Report types distribution
    const reportTypes: ReportType[] = [
        ReportType.ALERT_VERIFICATION,
        ReportType.ROUTINE_MONITORING,
        ReportType.INCIDENT_REPORT,
        ReportType.BIODIVERSITY_SURVEY,
        ReportType.ENFORCEMENT_ACTION,
    ];
    
    // Deforestation causes
    const causes: DeforestationCause[] = [
        DeforestationCause.AGRICULTURAL_EXPANSION,
        DeforestationCause.LOGGING,
        DeforestationCause.MINING,
        DeforestationCause.INFRASTRUCTURE,
        DeforestationCause.WILDFIRE,
        DeforestationCause.URBAN_EXPANSION,
        DeforestationCause.CHARCOAL_PRODUCTION,
    ];
    
    // Generate reports for the past 12 months (1 year) for better analytics
    // Increased from 80 to 200 reports
    for (let i = 0; i < 200; i++) {
        const region = regions[Math.floor(Math.random() * regions.length)];
        const officer = fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)];
        
        // Distribute reports more evenly across the time period
        const timeWeight = Math.pow(Math.random(), 0.6); // Bias towards recent dates
        const daysAgo = Math.floor(timeWeight * 365); // Last 12 months
        const reportDate = new Date(now);
        reportDate.setDate(reportDate.getDate() - daysAgo);
        
        // Add some randomness to the day
        const dayOffset = Math.floor(Math.random() * 28);
        reportDate.setDate(reportDate.getDate() - dayOffset);
        
        const visitDate = new Date(reportDate);
        visitDate.setHours(visitDate.getHours() - Math.floor(Math.random() * 8)); // Same day, earlier
        
        // Random report type
        const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        
        // Link to alert if it's a verification report
        const alertId = reportType === ReportType.ALERT_VERIFICATION && alerts.length > 0
            ? alerts[Math.floor(Math.random() * alerts.length)].id
            : null;
        
        // Link to patrol route for routine monitoring (30% chance)
        const patrolRouteId = reportType === ReportType.ROUTINE_MONITORING && patrolRoutes.length > 0 && Math.random() < 0.3
            ? patrolRoutes[Math.floor(Math.random() * patrolRoutes.length)].id
            : null;
        
        // Random coordinates within Northern Region of Sierra Leone only
        // Northern Region approximate bounds: 
        // Latitude: 8.5°N to 10.0°N
        // Longitude: -12.5°W to -11.0°W
        const latitude = 8.5 + Math.random() * 1.5; // ~8.5-10.0 (Northern Region)
        const longitude = -12.5 + Math.random() * 1.5; // ~-12.5 to -11.0 (Northern Region)
        
        // Generate report code
        const reportCode = `FR-${region.regionCode}-${String(i + 1).padStart(4, "0")}-${reportDate.getFullYear()}`;
        
        // Deforestation observed (60% chance)
        const deforestationObserved = Math.random() < 0.6;
        
        // Estimated area loss if deforestation observed
        const estimatedAreaLoss = deforestationObserved
            ? parseFloat((1 + Math.random() * 30).toFixed(2)) // 1-31 ha
            : null;
        
        // Cause if deforestation observed
        const cause = deforestationObserved
            ? causes[Math.floor(Math.random() * causes.length)]
            : null;
        
        // Title based on report type
        const titles = {
            [ReportType.ALERT_VERIFICATION]: `Verification of Alert ${alertId ? alertId.substring(0, 8) : "Investigation"}`,
            [ReportType.ROUTINE_MONITORING]: `Routine Monitoring - ${region.name}`,
            [ReportType.INCIDENT_REPORT]: `Incident Report - ${cause ? cause.replace(/_/g, " ") : "Deforestation Activity"}`,
            [ReportType.BIODIVERSITY_SURVEY]: `Biodiversity Survey - ${region.name}`,
            [ReportType.ENFORCEMENT_ACTION]: `Enforcement Action Report`,
        };
        
        const title = titles[reportType] || `Field Report - ${region.name}`;
        
        // Description
        const descriptions = {
            [ReportType.ALERT_VERIFICATION]: deforestationObserved
                ? `Field verification confirmed deforestation activity. Area affected: ${estimatedAreaLoss} hectares. Primary cause: ${cause?.replace(/_/g, " ")}. Evidence collected and documented.`
                : `Field verification completed. No significant deforestation activity detected. Area appears stable.`,
            [ReportType.ROUTINE_MONITORING]: `Routine patrol conducted in ${region.name}. ${deforestationObserved ? `Deforestation activity detected. Estimated loss: ${estimatedAreaLoss} hectares.` : "No significant issues observed. Forest condition stable."}`,
            [ReportType.INCIDENT_REPORT]: `Incident reported in ${region.name}. ${deforestationObserved ? `Deforestation confirmed. Area: ${estimatedAreaLoss} hectares. Cause: ${cause?.replace(/_/g, " ")}.` : "Investigation ongoing."}`,
            [ReportType.BIODIVERSITY_SURVEY]: `Biodiversity survey conducted in ${region.name}. ${deforestationObserved ? `Deforestation impact observed on local biodiversity.` : "Biodiversity assessment completed. Species diversity stable."}`,
            [ReportType.ENFORCEMENT_ACTION]: `Enforcement action taken in ${region.name}. ${deforestationObserved ? `Illegal activity stopped. Area affected: ${estimatedAreaLoss} hectares.` : "Preventive measures implemented."}`,
        };
        
        const description = descriptions[reportType] || `Field report from ${region.name}.`;
        
        // Verification (30% verified)
        const isVerified = Math.random() < 0.3;
        const verifiedBy = isVerified && admins.length > 0
            ? admins[Math.floor(Math.random() * admins.length)].id
            : null;
        const verifiedDate = isVerified
            ? new Date(reportDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) // Within 5 days
            : null;
        
        // Evidence photos (mock paths)
        const photoCount = deforestationObserved ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 3);
        const evidencePhotos = Array.from({ length: photoCount }, (_, idx) => 
            `/uploads/reports/${reportCode}-photo-${idx + 1}.jpg`
        );
        
        // Weather conditions
        const weatherOptions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Clear"];
        const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        
        // Temperature (Sierra Leone climate: 20-35°C)
        const temperature = parseFloat((20 + Math.random() * 15).toFixed(1));
        
        // Geometry (point)
        const geometry = {
            type: "Point",
            coordinates: [longitude, latitude],
        };
        
        // Accuracy (GPS accuracy in meters)
        const accuracy = parseFloat((5 + Math.random() * 15).toFixed(1)); // 5-20 meters
        
        // Notes
        const notes = deforestationObserved
            ? `Evidence collected: ${photoCount} photos. Immediate action required. Local community notified.`
            : `Standard monitoring completed. No immediate concerns.`;
        
        reports.push({
            reportCode,
            userId: officer.id,
            alertId,
            patrolRouteId,
            forestRegionId: region.id,
            reportDate,
            visitDate,
            reportType,
            title,
            description,
            latitude,
            longitude,
            geometry,
            accuracy,
            deforestationObserved,
            estimatedAreaLoss,
            cause,
            evidencePhotos,
            notes,
            weather,
            temperature,
            isVerified,
            verifiedBy,
            verifiedDate,
        });
    }
    
    // Create reports in batches
    for (const report of reports) {
        try {
            await prisma.fieldReport.create({
                data: report,
            });
        } catch (error: any) {
            // Skip if report code already exists
            if (error.code !== "P2002") {
                console.error(`Error creating report ${report.reportCode}:`, error);
            }
        }
    }
    
    console.log(`✅ Seeded ${reports.length} field reports!`);
}
