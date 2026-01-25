import { PrismaClient, OrganizationType } from "@prisma/client";

export async function seedOrganizations(prisma: PrismaClient) {
    const organizations = [
        {
            id: "org-001",
            name: "Forest Protection Agency",
            type: OrganizationType.GOVERNMENT,
            email: "info@fpa.gov.sl",
            phone: "+23212345678",
            address: "123 Freetown Rd, Freetown",
        },
        {
            id: "org-002",
            name: "Green Earth NGO",
            type: OrganizationType.NGO,
            email: "contact@greenearth.org",
            phone: "+23287654321",
            address: "45 Makeni St, Makeni",
        },
        {
            id: "org-003",
            name: "EcoWatch Community Group",
            type: OrganizationType.COMMUNITY,
            email: "ecowatch@example.com",
            phone: "+23211223344",
            address: "67 Kenema Ave, Kenema",
        },
    ];

    for (const org of organizations) {
        await prisma.organization.upsert({
            where: { id: org.id },
            update: { ...org, updatedAt: new Date() },
            create: org,
        });
    }

    console.log("✅ Organizations seeded!");
}
