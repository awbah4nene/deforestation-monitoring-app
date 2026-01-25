import { getSession } from "@/lib/auth/session";
import RootPageClient from "./RootPageClient";

export default async function RootPage() {
  const session = await getSession();

  // If user is logged in, redirect to their dashboard
  if (session?.user) {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  // Otherwise, show public homepage with header and footer
  return <RootPageClient />;
}
