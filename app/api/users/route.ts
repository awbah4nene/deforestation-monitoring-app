import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Try to fetch with organization field first, fallback without it
    let users;
    try {
      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          organization: true,
          position: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (selectError: any) {
      // If organization field doesn't exist, fetch without it
      if (selectError.message?.includes("organization")) {
        console.warn("Organization field not available, fetching without it");
        users = await prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            position: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: {
            name: "asc",
          },
        });
        // Add organization as null if not available
        users = users.map((u: any) => ({ ...u, organization: null }));
      } else {
        throw selectError;
      }
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only Admin can create users
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can create users." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      phone,
      organization,
      position,
    } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - handle organization field gracefully
    const userData: any = {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: (role as UserRole) || UserRole.FIELD_OFFICER,
      phone: phone?.trim() || null,
      position: position?.trim() || null,
      isActive: true,
    };

    // Only include organization if it's a valid field
    try {
      userData.organization = organization?.trim() || null;
    } catch (e) {
      // Field doesn't exist, skip it
      console.warn("Organization field not available for user creation");
    }

    let newUser;
    try {
      newUser = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          organization: true,
          position: true,
          isActive: true,
          createdAt: true,
        },
      });
    } catch (createError: any) {
      // If organization field doesn't exist, create without it
      if (createError.message?.includes("organization")) {
        const { organization: _, ...dataWithoutOrg } = userData;
        newUser = await prisma.user.create({
          data: dataWithoutOrg,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            position: true,
            isActive: true,
            createdAt: true,
          },
        });
        (newUser as any).organization = null;
      } else {
        throw createError;
      }
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
