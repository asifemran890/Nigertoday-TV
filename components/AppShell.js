"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useStore } from "@/lib/store";

export default function AppShell({ children }) {
  const { ready, session } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
