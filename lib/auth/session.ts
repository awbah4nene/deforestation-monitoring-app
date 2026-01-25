import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { UserRole } from "@prisma/client";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return user;
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

export function canManageAlerts(userRole: UserRole): boolean {
  return [
    UserRole.ADMIN,
    UserRole.GOVERNMENT_OFFICIAL,
    UserRole.FIELD_OFFICER,
  ].includes(userRole);
}

export function canViewReports(userRole: UserRole): boolean {
  return [
    UserRole.ADMIN,
    UserRole.GOVERNMENT_OFFICIAL,
    UserRole.FIELD_OFFICER,
    UserRole.STAKEHOLDER,
    UserRole.VIEWER,
  ].includes(userRole);
}

export function canCreateFieldReports(userRole: UserRole): boolean {
  return [
    UserRole.ADMIN,
    UserRole.GOVERNMENT_OFFICIAL,
    UserRole.FIELD_OFFICER,
  ].includes(userRole);
}

export function canManageUsers(userRole: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.GOVERNMENT_OFFICIAL].includes(userRole);
}
