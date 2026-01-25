import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/connect";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case UserRole.ADMIN:
      redirect("/dashboard/admin");
    case UserRole.GOVERNMENT_OFFICIAL:
      redirect("/dashboard/government");
    case UserRole.FIELD_OFFICER:
      redirect("/dashboard/field-officer");
    case UserRole.STAKEHOLDER:
      redirect("/dashboard/stakeholder");
    case UserRole.VIEWER:
      redirect("/dashboard/viewer");
    default:
      // Fallback to generic dashboard
      break;
  }

  // Generic dashboard (shouldn't reach here)
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
