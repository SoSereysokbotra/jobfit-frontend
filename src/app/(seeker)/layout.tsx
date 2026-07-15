"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/shared/components/layout/sidebar";
import BottomTabBar from "@/shared/components/layout/bottom-tab-bar";
import TopNav from "@/shared/components/layout/topnav";
import { Loader2 } from "lucide-react";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Start as false — both server and client agree on initial render
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jobfits_user");

    if (!stored) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      if (!user.onboardingComplete) {
        router.replace("/onboarding/profile");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  // Always render the full layout so server and client HTML match.
  // A fixed overlay covers the content until the auth check resolves.
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Auth-check overlay — only shown while !authChecked, same initial HTML on SSR */}
      {!authChecked && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4"
          style={{ background: "var(--color-bg-secondary)" }}
        >
          <Image src="/logo.png" alt="JobFits" width={64} height={64} className="rounded-xl" />
          <Loader2
            className="w-7 h-7 animate-spin"
            style={{ color: "var(--color-primary-600)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            Loading your workspace…
          </p>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
