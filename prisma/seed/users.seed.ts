import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
    const users = [
        {
            id: "user-001",
            name: "Admin User",
            email: "admin@example.com",
            role: UserRole.ADMIN,
            password: "Admin@123",
        },
        {
            id: "user-002",
            name: "Govt Officer",
            email: "govt@example.com",
            role: UserRole.GOVERNMENT_OFFICIAL,
            password: "Govt@123",
        },
        {
            id: "user-003",
            name: "Field Officer",
            email: "field@example.com",
            role: UserRole.FIELD_OFFICER,
            password: "Field@123",
        },
        {
            id: "user-004",
            name: "Stakeholder",
            email: "stakeholder@example.com",
            role: UserRole.STAKEHOLDER,
            password: "Stake@123",
        },
        {
            id: "user-005",
            name: "Viewer",
            email: "viewer@example.com",
            role: UserRole.VIEWER,
            password: "Viewer@123",
        },
    ];

    for (const user of users) {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                name: user.name,
                email: user.email,
                role: user.role,
                password: hashedPassword, // Update password with hashed version
            },
            create: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                password: hashedPassword,
            },
        });
    }

    console.log("✅ Users seeded!");
}
