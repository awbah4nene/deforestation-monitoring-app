"use client";

import PublicHomePage from "./(public)/page";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function RootPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1">
        <PublicHomePage />
      </main>
      <PublicFooter />
    </div>
  );
}
