"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { TransactionsView } from "@/components/TransactionsView";
import { CategoriesView } from "@/components/CategoriesView";
import { LoginPage } from "@/components/LoginPage";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "categories">("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

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

  // Prevent initial flicker of login page during hydration check
  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  // If not logged in, render Neobrutalist Login Page
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--insight-bg)] text-[var(--insight-text)]">
      {/* Top Bar Google 4-Color Accent */}
      <div className="google-top-bar" />

      {/* Neobrutalist Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-8 pt-8 overflow-y-auto max-h-screen">
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
