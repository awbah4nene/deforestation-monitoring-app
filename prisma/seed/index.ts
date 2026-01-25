import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { seedUsers } from "./users.seed";
import { seedOrganizations } from "./organizations.seed";
import { seedRegions } from "./regions.seed";
import { seedEarlyWarning } from "./earlyWarning.seed";
import { seedFieldOperations } from "./fieldOps.seed";
import { seedGovernance } from "./governance.seed";
import { seedOutreach } from "./outreach.seed";
import { seedAlerts } from "./alerts.seed";
import { seedFieldReports } from "./fieldReports.seed";

// Ensure DATABASE_URL is set
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL or DIRECT_URL environment variable is required. Please set it in your .env file or environment variables."
    );
}

// Create a PostgreSQL connection pool
const pool = new Pool({ connectionString: databaseUrl });

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// In Prisma 7, we need to pass the adapter to PrismaClient
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting full database seed...");

    await seedUsers(prisma);
    await seedOrganizations(prisma);
    await seedRegions(prisma);

    // Systems that depend on regions + users
    await seedEarlyWarning(prisma);
    await seedFieldOperations(prisma);
    await seedGovernance(prisma);
    await seedOutreach(prisma);
    
    // Seed alerts and field reports (depends on regions, users, and optionally alerts)
    await seedAlerts(prisma);
    await seedFieldReports(prisma);

    console.log("✅ ALL SEEDS COMPLETED");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
