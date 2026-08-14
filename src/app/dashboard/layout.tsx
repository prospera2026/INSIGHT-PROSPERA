"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("prospera_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const savedRole = localStorage.getItem("prospera_role") as "admin" | "user" | null;
    const savedSession = localStorage.getItem("prospera_session");
    if (!savedRole || !savedSession) {
      router.replace("/");
    } else {
      setUserRole(savedRole);
      setIsMounted(true);
    }
  }, [router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("prospera_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("prospera_theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("prospera_role");
    localStorage.removeItem("prospera_session");
    router.replace("/");
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row app-grid-bg text-[var(--insight-text)]">
      {/* Top Bar Google 4-Color Accent */}
      <div className="google-top-bar" />

      {/* MOBILE RESPONSIVE HEADER BAR (Insight Sales Style) */}
      <header className="md:hidden flex items-center justify-between p-3.5 bg-slate-900 text-white border-b-3 border-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 bg-slate-800 border-2 border-black active:translate-y-0.5"
            aria-label="Buka Menu"
          >
            <Menu className="w-4 h-4 text-[var(--google-blue)]" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[var(--google-blue)] border border-black flex items-center justify-center font-black text-white text-[10px]">
              P
            </div>
            <span className="font-extrabold text-sm tracking-wide">INSIGHT PROSPERA</span>
          </div>
        </div>
        <span className="insight-badge badge-green text-[8px] py-0.5 px-1.5">● ONLINE</span>
      </header>

      {/* BACKDROP FOR MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop Fixed / Mobile Drawer) */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-200 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          currentPath={pathname}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userRole={userRole}
          onLogout={handleLogout}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />
      </div>

      {/* Main Content Page View (With Explicit Engineering Grid Background) */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 pt-4 md:pt-8 overflow-y-auto max-h-screen app-grid-bg">
        {children}
      </main>
    </div>
  );
}
