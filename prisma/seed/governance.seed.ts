import {
    LegalStatus,
    PermitType,
    PermitStatus,
    ComplianceStatus,
    UserRole,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export async function seedGovernance(prisma: PrismaClient) {
    console.log("⚖️ Seeding Governance & Compliance...");

    const region = await prisma.forestRegion.findFirst();
    const admin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
    });

    if (!region || !admin) return;

    // Check if legal framework exists before creating
    const existingFramework = await prisma.legalFramework.findFirst({
        where: { title: "Forestry Act 2024" },
    });
    if (!existingFramework) {
        await prisma.legalFramework.create({
            data: {
                title: "Forestry Act 2024",
                jurisdiction: "Sierra Leone",
                legalType: "Act",
                status: LegalStatus.ENACTED,
                effectiveDate: new Date("2024-01-01"),
                description: "National forestry protection law",
                text: "Full legal text...",
                applicableRegions: ["ALL"],
            },
        });
    }

    await prisma.permit.upsert({
        where: { permitNumber: "PERMIT-001" },
        update: {},
        create: {
            permitNumber: "PERMIT-001",
            permitType: PermitType.LOGGING,
            regionId: region.id,
            applicantName: "Eco Timber Ltd",
            issuedDate: new Date(),
            expiryDate: new Date("2026-01-01"),
            status: PermitStatus.APPROVED,
            areaHectares: 50,
            purpose: "Selective logging",
            approvedActivities: ["Selective harvesting"],
            conditions: ["No protected species"],
        },
    });

    await prisma.complianceAudit.upsert({
        where: { auditCode: "AUDIT-001" },
        update: {},
        create: {
            auditCode: "AUDIT-001",
            regionId: region.id,
            auditorId: admin.id,
            auditDate: new Date(),
            scope: "Permit compliance",
            complianceStatus: ComplianceStatus.COMPLIANT,
            recommendations: ["Continue monitoring"],
        },
    });
}
