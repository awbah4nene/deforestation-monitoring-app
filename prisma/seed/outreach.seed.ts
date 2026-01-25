import {
    EngagementType,
    CampaignType,
    CampaignStatus,
    FeedbackType,
    UserRole,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export async function seedOutreach(prisma: PrismaClient) {
    console.log("📢 Seeding Outreach & Community...");

    const region = await prisma.forestRegion.findFirst();
    const admin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
    });

    if (!region || !admin) return;

    try {
        await prisma.communityEngagement.upsert({
            where: { eventId: "ENG-001" },
            update: {},
            create: {
                eventId: "ENG-001",
                eventName: "Forest Awareness Meeting",
                regionId: region.id,
                engagementType: EngagementType.WORKSHOP,
                organizerId: admin.id,
                participants: [],
                date: new Date(),
                location: "Kenema",
                objectives: ["Raise awareness"],
                attendanceCount: 120,
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }

    try {
        await prisma.awarenessCampaign.create({
            data: {
                campaignName: "Save Our Forests",
                campaignType: CampaignType.PUBLIC_AWARENESS,
                startDate: new Date(),
                endDate: new Date("2026-01-01"),
                status: CampaignStatus.ACTIVE,
                targetAudience: ["Communities"],
                regions: ["Eastern Province"],
                objectives: ["Reduce illegal logging"],
                reach: 5000,
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }

    try {
        await prisma.feedback.create({
            data: {
                submitterName: "Anonymous",
                feedbackType: FeedbackType.COMPLAINT,
                subject: "Illegal logging",
                message: "Trees being cut at night",
                submittedDate: new Date(),
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }
}
