import { PatrolStatus, EvidenceType, UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export async function seedFieldOperations(prisma: PrismaClient) {
    console.log("🚓 Seeding Field Operations...");

    const region = await prisma.forestRegion.findFirst();
    const officer = await prisma.user.findFirst({
        where: { role: UserRole.FIELD_OFFICER },
    });

    if (!region || !officer) return;

    try {
        await prisma.patrolRoute.create({
            data: {
                routeName: "Gola Boundary Patrol",
                regionId: region.id,
                assignedTo: [officer.id],
                plannedDate: new Date(),
                routeGeometry: { type: "LineString", coordinates: [] },
                objectives: ["Detect illegal logging"],
                equipmentNeeded: ["GPS", "Camera"],
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }

    try {
        await prisma.evidenceCollection.create({
            data: {
                collectedDate: new Date(),
                collectorId: officer.id,
                evidenceType: EvidenceType.PHOTO,
                description: "Fresh tree stumps found",
                filePaths: ["/evidence/stump1.jpg"],
                tags: ["illegal_logging"],
            },
        });
    } catch (error: any) {
        if (error.code !== "P2002") throw error;
    }
}
