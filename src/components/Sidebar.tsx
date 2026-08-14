"use client";

import React from "react";
import { LayoutDashboard, FileSpreadsheet, ShieldCheck, Moon, Sun, Database, LogOut, Tag } from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "transactions" | "categories";
  setActiveTab: (tab: "dashboard" | "transactions" | "categories") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  userRole: "admin" | "user";
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  userRole,
  onLogout,
}) => {
  return (
    <aside className="w-56 bg-[var(--insight-card)] border-r-4 border-[var(--insight-border)] flex flex-col justify-between p-3.5 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="mb-6 pb-3 border-b-3 border-[var(--insight-border)]">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 bg-[var(--google-blue)] border-2 border-black flex items-center justify-center font-black text-white text-sm shadow-[1.5px_1.5px_0_#000]">
              P
            </div>
            <span className="font-extrabold text-lg tracking-wider text-[var(--insight-text)]">
              PROSPERA
            </span>
          </div>
          <p className="text-[9px] font-extrabold tracking-widest text-[var(--google-blue)] uppercase">
            SAISOKU Financial Hub v1.0
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {/* Menu 1: Dashboard Utama */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 font-black text-[11px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all ${
              activeTab === "dashboard"
                ? "bg-[var(--google-blue)] text-white shadow-[3px_3px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_var(--insight-shadow)]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Utama</span>
          </button>

          {/* Menu 2: Upload Transc */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 font-black text-[11px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all ${
              activeTab === "transactions"
                ? "bg-[var(--google-blue)] text-white shadow-[3px_3px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_var(--insight-shadow)]"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>UPLOAD TRANSC</span>
          </button>

          {/* Menu 3: Kategori Transaksi */}
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 font-black text-[11px] uppercase tracking-wider border-2 border-[var(--insight-border)] transition-all ${
              activeTab === "categories"
                ? "bg-[var(--google-blue)] text-white shadow-[3px_3px_0_#0f172a] -translate-y-0.5"
                : "bg-[var(--insight-panel)] text-[var(--insight-text)] hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_var(--insight-shadow)]"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kategori Transaksi</span>
          </button>
        </nav>
      </div>

      {/* Footer & Mode Toggle */}
      <div className="space-y-4 pt-4 border-t-3 border-[var(--insight-border)]">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-3 py-2 border-2 border-[var(--insight-border)] bg-[var(--insight-panel)] text-xs font-bold shadow-[2px_2px_0_var(--insight-shadow)]"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            {darkMode ? "LIGHT MODE" : "DARK MODE"}
          </span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 border border-black">
            TOGGLE
          </span>
        </button>

        {/* Database Status */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-[var(--insight-border)] shadow-[2px_2px_0_var(--insight-shadow)]">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <Database className="w-3.5 h-3.5 text-[var(--google-green)]" />
            <span>STATUS DATA</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
            Local Parsed CSV / Demo State
          </p>
        </div>

        {/* User Info & Logout */}
        <div className="p-2 border-2 border-[var(--insight-border)] bg-[var(--insight-card)] space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--google-blue)]" />
            <div>
              <div className="text-[11px] font-extrabold uppercase">
                {userRole === "admin" ? "SAISOKU Admin" : "Member Key Access"}
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">
                Role: {userRole}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 border border-red-500 text-red-600 dark:text-red-300 text-[10px] font-black uppercase flex items-center justify-center gap-1"
          >
            <LogOut className="w-3 h-3" /> LOGOUT SESI
          </button>
        </div>
      </div>
    </aside>
  );
};
