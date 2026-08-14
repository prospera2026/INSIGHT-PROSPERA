"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { TransactionsView } from "@/components/TransactionsView";
import { CategoriesView } from "@/components/CategoriesView";
import { LoginPage } from "@/components/LoginPage";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";
import { Menu } from "lucide-react";

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "categories">("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Persistent session, theme, & Supabase data fetch on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("prospera_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const savedRole = localStorage.getItem("prospera_role") as "admin" | "user" | null;
    const savedSession = localStorage.getItem("prospera_session");
    if (savedRole && savedSession) {
      setIsLoggedIn(true);
      setUserRole(savedRole);
    }
    // Fetch data from Supabase DB (fallback to local DB)
    fetchTransactions().then((data) => {
      setTransactions(data);
      setIsMounted(true);
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("prospera_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("prospera_theme", "light");
    }
  }, [darkMode]);

  const handleLoginSuccess = (role: "admin" | "user", identifier: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("prospera_role", role);
    localStorage.setItem("prospera_session", identifier);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("prospera_role");
    localStorage.removeItem("prospera_session");
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--insight-bg)] text-[var(--insight-text)]">
      {/* Top Bar Google 4-Color Accent */}
      <div className="google-top-bar" />

      {/* MOBILE RESPONSIVE HEADER BAR */}
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
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileDrawerOpen(false);
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userRole={userRole}
          onLogout={handleLogout}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 pt-4 md:pt-8 overflow-y-auto max-h-screen">
        {activeTab === "dashboard" ? (
          <DashboardView
            transactions={transactions}
            onNavigateToTransactions={() => setActiveTab("transactions")}
          />
        ) : activeTab === "transactions" ? (
          <TransactionsView
            transactions={transactions}
            setTransactions={setTransactions}
            onNavigateToDashboard={() => setActiveTab("dashboard")}
            customCategories={customCategories}
          />
        ) : (
          <CategoriesView
            transactions={transactions}
            customCategories={customCategories}
            setCustomCategories={setCustomCategories}
          />
        )}
      </main>
    </div>
  );
}
