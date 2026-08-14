"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, FileSpreadsheet, ShieldCheck, Moon, Sun, Database, LogOut, Tag, X } from "lucide-react";

interface SidebarProps {
  currentPath: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  userRole: "admin" | "user";
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  darkMode,
  setDarkMode,
  userRole,
  onLogout,
  onCloseMobile,
}) => {
  const isDashboardActive = currentPath === "/dashboard";
  const isTransactionsActive = currentPath.startsWith("/dashboard/transactions");
  const isCategoriesActive = currentPath.startsWith("/dashboard/categories");

  return (
    <aside className="w-56 bg-[var(--insight-card)] border-r-4 border-[var(--insight-border)] flex flex-col justify-between p-3.5 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="mb-5 pb-2.5 border-b-3 border-[var(--insight-border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-6 h-6 bg-[var(--google-blue)] border-2 border-black flex items-center justify-center font-black text-white text-xs shadow-[1px_1px_0_#000]">
                P
              </div>
              <span className="font-extrabold text-base tracking-wider text-[var(--insight-text)]">
                PROSPERA
              </span>
            </div>
            <p className="text-[8.5px] font-extrabold tracking-widest text-[var(--google-blue)] uppercase">
              SAISOKU Financial Hub
            </p>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 border-2 border-black bg-slate-100 dark:bg-slate-800 text-black dark:text-white"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Menu (Compact Next.js Link Routing) */}
        <nav className="space-y-1.5">
          {/* Menu 1: Dashboard Utama */}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 font-black text-[10px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all font-sans ${
              isDashboardActive
                ? "bg-[var(--google-blue)] text-white shadow-[2px_2px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[1.5px_1.5px_0_var(--insight-shadow)]"
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard Utama</span>
          </Link>

          {/* Menu 2: Upload Transc */}
          <Link
            href="/dashboard/transactions"
            onClick={onCloseMobile}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 font-black text-[10px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all font-sans ${
              isTransactionsActive
                ? "bg-[var(--google-blue)] text-white shadow-[2px_2px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[1.5px_1.5px_0_var(--insight-shadow)]"
            }`}
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>UPLOAD TRANSC</span>
          </Link>

          {/* Menu 3: Kategori Transaksi */}
          <Link
            href="/dashboard/categories"
            onClick={onCloseMobile}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 font-black text-[10px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all font-sans ${
              isCategoriesActive
                ? "bg-[var(--google-blue)] text-white shadow-[2px_2px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[1.5px_1.5px_0_var(--insight-shadow)]"
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Kategori Transaksi</span>
          </Link>
        </nav>
      </div>

      {/* Footer & Mode Toggle */}
      <div className="space-y-3 pt-3 border-t-3 border-[var(--insight-border)]">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 border-2 border-[var(--insight-border)] bg-[var(--insight-panel)] text-xs font-bold shadow-[2px_2px_0_var(--insight-shadow)]"
        >
          <span className="flex items-center gap-1.5">
            {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            {darkMode ? "LIGHT MODE" : "DARK MODE"}
          </span>
          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 border border-black">
            TOGGLE
          </span>
        </button>


        {/* User Info & Logout */}
        <div className="p-2 border-2 border-[var(--insight-border)] bg-[var(--insight-card)] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--google-blue)]" />
            <div>
              <div className="text-[10px] font-extrabold uppercase">
                {userRole === "admin" ? "SAISOKU Admin" : "Member Key Access"}
              </div>
              <div className="text-[8.5px] text-slate-500 font-bold uppercase">
                Role: {userRole}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-1 bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 border border-red-500 text-red-600 dark:text-red-300 text-[9.5px] font-black uppercase flex items-center justify-center gap-1"
          >
            <LogOut className="w-3 h-3" /> LOGOUT SESI
          </button>
        </div>
      </div>
    </aside>
  );
};
