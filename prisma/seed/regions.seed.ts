import {
    PrismaClient,
    VegetationType,
    ProtectionStatus,
} from "@prisma/client";

export async function seedRegions(prisma: PrismaClient) {
    console.log("🌍 Seeding forest regions...");

    // Northern Region of Sierra Leone districts: Bombali, Kambia, Koinadugu, Port Loko, Tonkolili
    const regionsData = [
        {
            name: "Outamba-Kilimi National Park",
            regionCode: "SL-NR-OUTAMBA",
            district: "Bombali",
            chiefdom: "Makari Gbanti",
            areaHectares: 110000,
            vegetationType: VegetationType.SAVANNAH,
            protectionStatus: ProtectionStatus.NATIONAL_PARK,
            population: 5000,
            description: "Northern region national park with savanna woodland in Bombali District",
            centroid: { type: "Point", coordinates: [-12.2, 9.0] },
        },
        {
            name: "Loma Mountains Forest Reserve",
            regionCode: "SL-NR-LOMA",
            district: "Koinadugu",
            chiefdom: "Sulima",
            areaHectares: 33000,
            vegetationType: VegetationType.MONTANE_FOREST,
            protectionStatus: ProtectionStatus.CONSERVATION_AREA,
            population: 1500,
            description: "Montane forest in northern highlands, Koinadugu District",
            centroid: { type: "Point", coordinates: [-11.3, 9.2] },
        },
        {
            name: "Kangari Hills Forest Reserve",
            regionCode: "SL-NR-KANGARI",
            district: "Tonkolili",
            chiefdom: "Yoni",
            areaHectares: 45000,
            vegetationType: VegetationType.TROPICAL_RAINFOREST,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 2000,
            description: "Mountain forest reserve in Tonkolili District, Northern Region",
            centroid: { type: "Point", coordinates: [-11.8, 8.5] },
        },
        {
            name: "Mamunta Mayosso Wildlife Sanctuary",
            regionCode: "SL-NR-MAMUNTA",
            district: "Port Loko",
            chiefdom: "Maforki",
            areaHectares: 15000,
            vegetationType: VegetationType.SAVANNAH,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 1000,
            description: "Wildlife sanctuary in Port Loko District, Northern Region",
            centroid: { type: "Point", coordinates: [-12.8, 8.8] },
        },
        {
            name: "Bombali Forest Reserve",
            regionCode: "SL-NR-BOMBALI",
            district: "Bombali",
            chiefdom: "Makari Gbanti",
            areaHectares: 28000,
            vegetationType: VegetationType.TROPICAL_RAINFOREST,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 3000,
            description: "Forest reserve in Bombali District, Northern Region",
            centroid: { type: "Point", coordinates: [-12.0, 9.0] },
        },
        {
            name: "Kambia Coastal Forest",
            regionCode: "SL-NR-KAMBIA",
            district: "Kambia",
            chiefdom: "Samu",
            areaHectares: 18000,
            vegetationType: VegetationType.MANGROVE,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 2000,
            description: "Coastal mangrove forest in Kambia District, Northern Region",
            centroid: { type: "Point", coordinates: [-12.9, 9.1] },
        },
        {
            name: "Tonkolili Hills Conservation Area",
            regionCode: "SL-NR-TONKOLILI",
            district: "Tonkolili",
            chiefdom: "Kholifa Rowalla",
            areaHectares: 25000,
            vegetationType: VegetationType.SECONDARY_FOREST,
            protectionStatus: ProtectionStatus.CONSERVATION_AREA,
            population: 1800,
            description: "Conservation area in Tonkolili District, Northern Region",
            centroid: { type: "Point", coordinates: [-11.5, 8.7] },
        },
        {
            name: "Port Loko Community Forest",
            regionCode: "SL-NR-PORTLOKO",
            district: "Port Loko",
            chiefdom: "Koya",
            areaHectares: 12000,
            vegetationType: VegetationType.MIXED_FOREST,
            protectionStatus: ProtectionStatus.COMMUNITY_FOREST,
            population: 2500,
            description: "Community-managed forest in Port Loko District, Northern Region",
            centroid: { type: "Point", coordinates: [-12.7, 8.6] },
        },
        {
            name: "Koinadugu Highlands Reserve",
            regionCode: "SL-NR-KOINADUGU",
            district: "Koinadugu",
            chiefdom: "Sulima",
            areaHectares: 35000,
            vegetationType: VegetationType.MONTANE_FOREST,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 1200,
            description: "Highland forest reserve in Koinadugu District, Northern Region",
            centroid: { type: "Point", coordinates: [-11.4, 9.3] },
        },
        {
            name: "Bombali Savanna Woodland",
            regionCode: "SL-NR-BOMBALI-SAV",
            district: "Bombali",
            chiefdom: "Makari Gbanti",
            areaHectares: 22000,
            vegetationType: VegetationType.SAVANNAH,
            protectionStatus: ProtectionStatus.PROTECTED_AREA,
            population: 1500,
            description: "Savanna woodland in Bombali District, Northern Region",
            centroid: { type: "Point", coordinates: [-12.1, 9.1] },
        },
    ];

    const createdRegions = [];
    for (const regionData of regionsData) {
        const geometry = {
            type: "Polygon",
            coordinates: [[
                [regionData.centroid.coordinates[0] - 0.1, regionData.centroid.coordinates[1] - 0.1],
                [regionData.centroid.coordinates[0] + 0.1, regionData.centroid.coordinates[1] - 0.1],
                [regionData.centroid.coordinates[0] + 0.1, regionData.centroid.coordinates[1] + 0.1],
                [regionData.centroid.coordinates[0] - 0.1, regionData.centroid.coordinates[1] + 0.1],
                [regionData.centroid.coordinates[0] - 0.1, regionData.centroid.coordinates[1] - 0.1],
            ]],
        };

        const region = await prisma.forestRegion.upsert({
            where: { regionCode: regionData.regionCode },
            update: {},
            create: {
                name: regionData.name,
                regionCode: regionData.regionCode,
                district: regionData.district,
                chiefdom: regionData.chiefdom,
                areaHectares: regionData.areaHectares,
                vegetationType: regionData.vegetationType,
                protectionStatus: regionData.protectionStatus,
                description: regionData.description,
                population: regionData.population,
                geometry,
                centroid: regionData.centroid,
            },
        });
        createdRegions.push(region);
    }

    console.log(`✅ Seeded ${createdRegions.length} forest regions!`);

    return createdRegions;
}
