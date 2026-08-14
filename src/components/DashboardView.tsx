"use client";

import React from "react";
import { Transaction } from "@/lib/transactions";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity, FileSpreadsheet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface DashboardViewProps {
  transactions: Transaction[];
  onNavigateToTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onNavigateToTransactions,
}) => {
  // Calculated Financial Metrics
  const totalDebit = transactions.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = transactions.reduce((acc, curr) => acc + curr.credit, 0);
  const netBalance = totalCredit - totalDebit;

  // Chart Data Processing
  const chartMap: Record<string, { date: string; debit: number; credit: number }> = {};

  transactions.forEach((t) => {
    const rawDate = t.postDate.split(" ")[0]; // Get DD/MM/YY
    if (!chartMap[rawDate]) {
      chartMap[rawDate] = { date: rawDate, debit: 0, credit: 0 };
    }
    chartMap[rawDate].debit += t.debit;
    chartMap[rawDate].credit += t.credit;
  });

  const chartData = Object.values(chartMap);

  // Category Breakdown
  const categoryMap: Record<string, number> = {};
  transactions.forEach((t) => {
    const cat = t.category || "Lain-lain";
    const amount = t.debit > 0 ? t.debit : t.credit;
    categoryMap[cat] = (categoryMap[cat] || 0) + amount;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="insight-card p-4 bg-slate-900 text-white border-3 border-black relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="inline-block px-1.5 py-0.5 bg-[var(--google-blue)] text-white text-[9px] font-extrabold tracking-widest uppercase mb-1 border border-black shadow-[1.5px_1.5px_0_#000]">
              RINGKASAN EKSEKUTIF
            </div>
            <h1 className="text-base font-black tracking-tight">DASHBOARD UTAMA ARUS KAS</h1>
            <p className="text-[11px] text-slate-300 font-medium">
              Pemantauan real-time saldo, pengeluaran debit, dan pemasukan kredit SAISOKU.ID.
            </p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="insight-button insight-button--primary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> KELOLA & REKAP DATA
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Debit / Pengeluaran */}
        <div className="insight-card p-3.5 border-l-6 border-l-[var(--google-red)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              TOTAL DEBIT (PENGELUARAN)
            </span>
            <div className="w-6 h-6 bg-red-100 border border-black flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-[var(--google-red)]" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatIDR(totalDebit)}
          </div>
          <div className="mt-1 flex items-center text-[10px] font-bold text-red-600 gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{transactions.filter((t) => t.debit > 0).length} Transaksi Keluar</span>
          </div>
        </div>

        {/* Total Credit / Pemasukan */}
        <div className="insight-card p-3.5 border-l-6 border-l-[var(--google-green)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              TOTAL KREDIT (PEMASUKAN)
            </span>
            <div className="w-6 h-6 bg-green-100 border border-black flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--google-green)]" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatIDR(totalCredit)}
          </div>
          <div className="mt-1 flex items-center text-[10px] font-bold text-green-600 gap-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>{transactions.filter((t) => t.credit > 0).length} Transaksi Masuk</span>
          </div>
        </div>

        {/* Net Balance */}
        <div
          className={`insight-card p-3.5 border-l-6 ${
            netBalance >= 0 ? "border-l-[var(--google-blue)]" : "border-l-[var(--google-yellow)]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              NET BALANCE (ARUS BERSIH)
            </span>
            <div className="w-6 h-6 bg-blue-100 border border-black flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-[var(--google-blue)]" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatIDR(netBalance)}
          </div>
          <div className="mt-1 flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-300 gap-1">
            <Activity className="w-3 h-3" />
            <span>Status: {netBalance >= 0 ? "SURPLUS" : "DEFISIT PERIODE"}</span>
          </div>
        </div>
      </div>

      {/* Main Cash Flow Chart */}
      <div className="insight-card p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b-3 border-[var(--insight-border)]">
          <div>
            <h3 className="font-extrabold text-base uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--google-blue)]" />
              GRAFIK ARUS KAS PER TANGGAL (DEBIT VS KREDIT)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Perbandingan tren pengeluaran dan akumulasi penerimaan dana.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(val: number) => formatIDR(val)}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#0f172a",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderRadius: "0px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="debit" name="Pengeluaran (Debit)" fill="#EA4335" stroke="#000" strokeWidth={2} />
              <Bar dataKey="credit" name="Pemasukan (Kredit)" fill="#34A853" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Recent Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="insight-card p-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 pb-2 border-b-2 border-black">
            BREAKDOWN ALOKASI KATEGORI
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryMap).map(([category, amount]) => {
              const pct = totalDebit + totalCredit > 0 ? (amount / (totalDebit + totalCredit)) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{category}</span>
                    <span className="font-mono">{formatIDR(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-200 border border-black h-3 overflow-hidden">
                    <div
                      className="bg-[var(--google-blue)] h-full border-r border-black"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Snippet */}
        <div className="insight-card p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              5 TRANSAKSI TERAKHIR
            </h3>
            <button
              onClick={onNavigateToTransactions}
              className="text-[11px] font-bold text-[var(--google-blue)] hover:underline uppercase"
            >
              LIHAT SEMUA →
            </button>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-2 border-2 border-[var(--insight-border)] bg-[var(--insight-panel)] flex justify-between items-center text-xs"
              >
                <div>
                  <div className="font-bold truncate max-w-[220px]">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{t.postDate}</div>
                </div>
                <div className="text-right font-mono font-bold">
                  {t.debit > 0 ? (
                    <span className="text-red-600">-{formatIDR(t.debit)}</span>
                  ) : (
                    <span className="text-green-600">+{formatIDR(t.credit)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
