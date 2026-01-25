import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import DashboardNav from "./components/DashboardNav";
import DashboardSidebar from "./components/DashboardSidebar";
import NotificationProvider from "@/components/notifications/NotificationProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav user={session.user} />
        <div className="flex">
          <DashboardSidebar userRole={session.user.role} />
          <main className="flex-1 p-6 overflow-x-hidden min-w-0">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}
