import {
    PrismaClient,
    AlertSeverity,
    AlertStatus,
} from "@prisma/client";

export async function seedAlerts(prisma: PrismaClient) {
    console.log("🚨 Seeding Deforestation Alerts...");

    // Get regions and users
    const regions = await prisma.forestRegion.findMany();
    const fieldOfficers = await prisma.user.findMany({
        where: { role: "FIELD_OFFICER" },
    });
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
    });

    if (regions.length === 0) {
        console.log("⚠️ No regions found. Skipping alerts seed.");
        return;
    }

    const alerts = [];
    const now = new Date();
    
    // Generate alerts for the past 24 months (2 years) for better analytics
    // This ensures we have data across multiple years and months
    const monthsBack = 24;
    const totalAlerts = 500; // Increased to 500 alerts for comprehensive data
    
    // Generate alerts with better time distribution
    for (let i = 0; i < totalAlerts; i++) {
        const region = regions[Math.floor(Math.random() * regions.length)];
        
        // Distribute alerts more evenly across the time period
        // Use a weighted distribution to have more recent alerts but still spread out
        const timeWeight = Math.pow(Math.random(), 0.7); // Bias towards recent dates
        const daysAgo = Math.floor(timeWeight * monthsBack * 30); // Up to 24 months ago
        const detectedDate = new Date(now);
        detectedDate.setDate(detectedDate.getDate() - daysAgo);
        
        // Add some randomness to the day within the month
        const dayOffset = Math.floor(Math.random() * 28); // Random day in month
        detectedDate.setDate(detectedDate.getDate() - dayOffset);
        
        const alertDate = new Date(detectedDate);
        alertDate.setHours(alertDate.getHours() - Math.floor(Math.random() * 24));
        
        // Random severity distribution (more medium/high than critical/low)
        // Adjusted to have more variety for analytics
        const severityRand = Math.random();
        let severity: AlertSeverity;
        if (severityRand < 0.08) severity = AlertSeverity.CRITICAL; // 8% critical
        else if (severityRand < 0.25) severity = AlertSeverity.HIGH; // 17% high
        else if (severityRand < 0.65) severity = AlertSeverity.MEDIUM; // 40% medium
        else severity = AlertSeverity.LOW; // 35% low
        
        // Status distribution
        const statusRand = Math.random();
        let status: AlertStatus;
        if (statusRand < 0.2) status = AlertStatus.PENDING;
        else if (statusRand < 0.5) status = AlertStatus.VERIFIED;
        else if (statusRand < 0.7) status = AlertStatus.ACTION_TAKEN;
        else if (statusRand < 0.9) status = AlertStatus.RESOLVED;
        else status = AlertStatus.FALSE_ALARM;
        
        // Area based on severity
        let areaHectares: number;
        if (severity === AlertSeverity.CRITICAL) {
            areaHectares = 50 + Math.random() * 100; // 50-150 ha
        } else if (severity === AlertSeverity.HIGH) {
            areaHectares = 20 + Math.random() * 50; // 20-70 ha
        } else if (severity === AlertSeverity.MEDIUM) {
            areaHectares = 5 + Math.random() * 20; // 5-25 ha
        } else {
            areaHectares = 1 + Math.random() * 10; // 1-11 ha
        }
        
        // Confidence based on severity
        let confidence: number;
        if (severity === AlertSeverity.CRITICAL) {
            confidence = 0.85 + Math.random() * 0.15; // 0.85-1.0
        } else if (severity === AlertSeverity.HIGH) {
            confidence = 0.75 + Math.random() * 0.15; // 0.75-0.9
        } else if (severity === AlertSeverity.MEDIUM) {
            confidence = 0.65 + Math.random() * 0.15; // 0.65-0.8
        } else {
            confidence = 0.5 + Math.random() * 0.2; // 0.5-0.7
        }
        
        // Priority based on severity
        let priority: number;
        if (severity === AlertSeverity.CRITICAL) priority = 8 + Math.floor(Math.random() * 3); // 8-10
        else if (severity === AlertSeverity.HIGH) priority = 6 + Math.floor(Math.random() * 2); // 6-7
        else if (severity === AlertSeverity.MEDIUM) priority = 4 + Math.floor(Math.random() * 2); // 4-5
        else priority = 1 + Math.floor(Math.random() * 3); // 1-3
        
        // Random coordinates within Northern Region of Sierra Leone only
        // Northern Region approximate bounds: 
        // Latitude: 8.5°N to 10.0°N
        // Longitude: -12.5°W to -11.0°W
        const latitude = 8.5 + Math.random() * 1.5; // ~8.5-10.0 (Northern Region)
        const longitude = -12.5 + Math.random() * 1.5; // ~-12.5 to -11.0 (Northern Region)
        
        // Generate alert code with year and month for uniqueness
        const year = detectedDate.getFullYear();
        const month = String(detectedDate.getMonth() + 1).padStart(2, "0");
        const alertCode = `ALERT-${region.regionCode}-${year}${month}-${String(i + 1).padStart(4, "0")}`;
        
        // Assign to field officer if verified or action taken
        const assignedToId = (status === AlertStatus.VERIFIED || status === AlertStatus.ACTION_TAKEN) && fieldOfficers.length > 0
            ? fieldOfficers[Math.floor(Math.random() * fieldOfficers.length)].id
            : null;
        
        // Verified date if status is verified or beyond
        const verifiedDate = (status === AlertStatus.VERIFIED || status === AlertStatus.ACTION_TAKEN || status === AlertStatus.RESOLVED)
            ? new Date(detectedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Within 7 days
            : null;
        
        const verifiedBy = verifiedDate && admins.length > 0
            ? admins[Math.floor(Math.random() * admins.length)].id
            : null;
        
        // Geometry (simple polygon around the point)
        const geometry = {
            type: "Polygon",
            coordinates: [[
                [longitude - 0.01, latitude - 0.01],
                [longitude + 0.01, latitude - 0.01],
                [longitude + 0.01, latitude + 0.01],
                [longitude - 0.01, latitude + 0.01],
                [longitude - 0.01, latitude - 0.01],
            ]],
        };
        
        // NDVI change (negative for deforestation)
        const ndviChange = -(0.1 + Math.random() * 0.3); // -0.1 to -0.4
        
        alerts.push({
            alertCode,
            forestRegionId: region.id,
            latitude,
            longitude,
            geometry,
            alertDate,
            detectedDate,
            areaHectares: parseFloat(areaHectares.toFixed(2)),
            confidence: parseFloat(confidence.toFixed(2)),
            severity,
            status,
            priority,
            ndviChange: parseFloat(ndviChange.toFixed(3)),
            brightnessChange: parseFloat((0.05 + Math.random() * 0.15).toFixed(3)),
            texturalChange: parseFloat((0.1 + Math.random() * 0.2).toFixed(3)),
            assignedToId,
            verifiedDate,
            verifiedBy,
            verificationNotes: verifiedDate ? "Verified through satellite imagery analysis and field verification." : null,
            estimatedLoss: parseFloat((areaHectares * (150 + Math.random() * 100)).toFixed(2)), // tons CO2e
        });
    }
    
    // Create alerts in batches
    for (const alert of alerts) {
        try {
            await prisma.deforestationAlert.create({
                data: alert,
            });
        } catch (error: any) {
            // Skip if alert code already exists
            if (error.code !== "P2002") {
                console.error(`Error creating alert ${alert.alertCode}:`, error);
            }
        }
    }
    
    console.log(`✅ Seeded ${alerts.length} deforestation alerts!`);
}
