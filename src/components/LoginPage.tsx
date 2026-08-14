"use client";

import React, { useState } from "react";
import { Lock, KeyRound, ShieldCheck, Mail, Eye, EyeOff, Sun, Moon, ArrowRight } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (userRole: "admin" | "user", keyOrEmail: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<"key" | "admin">("key");
  const [accessKey, setAccessKey] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const key = accessKey.trim().toUpperCase();
    if (key === "AGUNG69") {
      onLoginSuccess("user", key);
    } else {
      setErrorMessage("Access Key Salah! Gunakan kode akses resmi: AGUNG69");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const user = adminUser.trim().toLowerCase();
    const pass = adminPass.trim();

    if (user === "prospera@gmail.com" && pass === "prospera123") {
      onLoginSuccess("admin", user);
    } else {
      setErrorMessage("Kredensial Admin Salah! Gunakan prospera@gmail.com & prospera123");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Top Bar Google 4-Color Accent */}
      <div className="google-top-bar" />

      {/* Main Login Shell (Split 2 Panel - Showcase & Form) */}
      <div className="login-shell w-full max-w-[840px] border-4 border-black bg-white dark:bg-slate-900 shadow-[8px_8px_0_#000] grid grid-cols-1 md:grid-cols-12 overflow-hidden insight-page-fade">
        
        {/* LEFT PANEL: SHOWCASE BRANDING (Neobrutalist Gradient & Blobs) */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 opacity-70 blur-xl pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 opacity-60 blur-lg pointer-events-none" />

          <div className="relative z-10">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white border-2 border-black shadow-[3px_3px_0_#000] flex items-center justify-center font-black text-black text-xl">
                P
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-[2px_2px_0_#000]">
                INSIGHT PROSPERA
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-block px-2 py-0.5 bg-black/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase border border-white/30">
                SAISOKU FINANCIAL HUB
              </span>
              <h2 className="text-xl font-extrabold leading-snug">
                Sistem Dashboard Keuangan & Rekap Mutasi Bank
              </h2>
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                Kelola transaksi perbankan, analisis pengeluaran debit/kredit, dan proses CSV secara instan.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-6 border-t border-white/20 grid grid-cols-3 gap-2 text-left">
            <div>
              <div className="text-xs font-black text-amber-300">Parser CSV</div>
              <div className="text-[9px] text-white/80 font-bold">PapaParse Live</div>
            </div>
            <div>
              <div className="text-xs font-black text-amber-300">Multi-Role</div>
              <div className="text-[9px] text-white/80 font-bold">Admin & Member</div>
            </div>
            <div>
              <div className="text-xs font-black text-amber-300">Security</div>
              <div className="text-[9px] text-white/80 font-bold">Encrypted RLS</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORM LOGIN */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[var(--insight-card)] text-[var(--insight-text)]">
          <div>
            {/* Top Bar Header inside Form */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-extrabold text-[var(--google-blue)] uppercase tracking-wider">
                  AUTHENTICATION PORTAL
                </p>
                <h1 className="text-lg font-black tracking-tight">INSIGHT PROSPERA LOGIN</h1>
              </div>

              {/* Status Badge */}
              <div className="insight-badge insight-badge--blue">
                v1.0 ONLINE
              </div>
            </div>

            {/* ERROR NOTIFICATION IF ANY */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-100 dark:bg-red-950 border-2 border-red-500 text-red-700 dark:text-red-300 text-xs font-bold shadow-[3px_3px_0_#000]">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* LOGIN MODE TABS */}
            <div className="flex border-2 border-black bg-slate-100 dark:bg-slate-800 p-1 mb-6 shadow-[3px_3px_0_var(--insight-shadow)]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("key");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "key"
                    ? "bg-white dark:bg-slate-900 text-[var(--google-blue)] border-2 border-black shadow-[2px_2px_0_#000]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Access Key (Member)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "admin"
                    ? "bg-white dark:bg-slate-900 text-[var(--google-blue)] border-2 border-black shadow-[2px_2px_0_#000]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
              </button>
            </div>

            {/* TAB 1: ACCESS KEY (MEMBER) */}
            {activeTab === "key" && (
              <form onSubmit={handleKeyLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5">
                    Access Key 6-Digit
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      maxLength={7}
                      placeholder="AGUNG69"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                      className="insight-input pl-9 w-full text-center tracking-[0.25em] font-mono text-base font-black uppercase text-[var(--google-blue)]"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  💡 Masukkan 6 digit kunci akses keuangan Anda untuk langsung membuka dashboard rekap data.
                </div>

                <button
                  type="submit"
                  className="insight-button insight-button--primary w-full py-3 text-xs flex items-center justify-center gap-2"
                >
                  MASUK KE DASHBOARD PROSPERA <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 2: ADMIN LOGIN */}
            {activeTab === "admin" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5">
                    Email / Username Admin
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="prospera@gmail.com"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="insight-input pl-9 w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5">
                    Password Admin
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="insight-input pl-9 pr-9 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="insight-button insight-button--primary w-full py-3 text-xs flex items-center justify-center gap-2"
                >
                  LOGIN ADMIN PANEL <ShieldCheck className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer inside Login Form */}
          <div className="mt-8 pt-4 border-t border-[var(--insight-border)] flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>© 2026 SAISOKU.ID — PROSPERA</span>
            <span>Neobrutalist Auth Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
