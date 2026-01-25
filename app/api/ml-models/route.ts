/**
 * ML Models Management API
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const models = await prisma.mLModel.findMany({
      where,
      include: {
        _count: {
          select: {
            predictions: true,
            validations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching ML models:", error);
    return NextResponse.json(
      { error: "Failed to fetch ML models" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([UserRole.ADMIN]);

    const body = await request.json();
    const {
      name,
      modelType,
      version,
      description,
      modelPath,
      accuracy,
      precision,
      recall,
      f1Score,
      isActive = true,
    } = body;

    const model = await prisma.mLModel.create({
      data: {
        name,
        modelType,
        version,
        description,
        modelPath,
        accuracy,
        precision,
        recall,
        f1Score,
        isActive,
      },
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    console.error("Error creating ML model:", error);
    return NextResponse.json(
      { error: "Failed to create ML model" },
      { status: 500 }
    );
  }
}
