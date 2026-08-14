"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/transactions";
import { Filter, Calendar } from "lucide-react";

interface DashboardViewProps {
  transactions: Transaction[];
  onNavigateToTransactions: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onNavigateToTransactions,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const [filterType, setFilterType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [filterValue, setFilterValue] = useState<string>(`${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}`);

  // Helper date parser
  const parseAndFormatDate = (rawDate: string) => {
    if (!rawDate || rawDate === "-") return "-";
    const parts = rawDate.split(/[\/\s-]/);
    if (parts.length >= 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      return `${d}/${m}/${y}`;
    }
    return rawDate;
  };

  // Filter transactions by period
  const filteredTransactions = transactions.filter((t) => {
    if (!filterValue || transactions.length === 0) return true;
    const formattedDate = parseAndFormatDate(t.postDate);
    const dateParts = formattedDate.split("/");
    if (dateParts.length !== 3) return true;

    const month = dateParts[1];
    const year = dateParts[2];

    if (filterType === "monthly") {
      return `${year}-${month}` === filterValue;
    } else if (filterType === "quarterly") {
      const [targetYear, qStr] = filterValue.split("-");
      if (year !== targetYear) return false;
      const monthNum = parseInt(month, 10);
      if (qStr === "Q1") return monthNum >= 1 && monthNum <= 3;
      if (qStr === "Q2") return monthNum >= 4 && monthNum <= 6;
      if (qStr === "Q3") return monthNum >= 7 && monthNum <= 9;
      if (qStr === "Q4") return monthNum >= 10 && monthNum <= 12;
    } else if (filterType === "yearly") {
      return year === filterValue;
    }
    return true;
  });

  const totalDebit = filteredTransactions.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = filteredTransactions.reduce((acc, curr) => acc + curr.credit, 0);
  const netBalance = totalCredit - totalDebit;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Metadata 2 Calculation (Rekap Bulanan Jan - Des)
  const monthlyMap: Record<string, { debit: number; credit: number }> = {};
  MONTH_NAMES.forEach((m) => (monthlyMap[m] = { debit: 0, credit: 0 }));

  transactions.forEach((t) => {
    const formattedDate = parseAndFormatDate(t.postDate);
    const dateParts = formattedDate.split("/");
    if (dateParts.length === 3) {
      const monthIdx = parseInt(dateParts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = MONTH_NAMES[monthIdx];
        monthlyMap[mName].debit += t.debit;
        monthlyMap[mName].credit += t.credit;
      }
    }
  });

  let activeMonthIndices: number[] = [];
  if (filterValue) {
    if (filterType === "monthly") {
      const [, monthStr] = filterValue.split("-");
      if (monthStr) activeMonthIndices.push(parseInt(monthStr, 10) - 1);
    } else if (filterType === "quarterly") {
      const [, qStr] = filterValue.split("-");
      if (qStr === "Q1") activeMonthIndices = [0, 1, 2];
      if (qStr === "Q2") activeMonthIndices = [3, 4, 5];
      if (qStr === "Q3") activeMonthIndices = [6, 7, 8];
      if (qStr === "Q4") activeMonthIndices = [9, 10, 11];
    } else if (filterType === "yearly") {
      activeMonthIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
  }

  // Metadata 3 Calculation (Top 5 Nominal)
  const top5Transactions = [...filteredTransactions]
    .sort((a, b) => Math.max(b.debit, b.credit) - Math.max(a.debit, a.credit))
    .slice(0, 5);

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as "monthly" | "quarterly" | "yearly";
    setFilterType(type);
    if (type === "monthly") {
      setFilterValue(`${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}`);
    } else if (type === "quarterly") {
      const currentQuarter = Math.floor(currentMonthIdx / 3) + 1;
      setFilterValue(`${currentYear}-Q${currentQuarter}`);
    } else {
      setFilterValue(String(currentYear));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner & Right-Aligned Compact Filters */}
      <div className="insight-card p-3.5 bg-slate-900 text-white border-3 border-black relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1">
          <div className="inline-block px-1.5 py-0.5 bg-[var(--google-blue)] text-white text-[8.5px] font-extrabold tracking-widest uppercase mb-1 border border-black shadow-[1.5px_1.5px_0_#000]">
            RINGKASAN EKSEKUTIF
          </div>
          <h1 className="text-sm font-black tracking-tight leading-tight">DASHBOARD UTAMA ARUS KAS</h1>
          <p className="text-[10.5px] text-slate-300 font-medium">
            Pemantauan saldo real-time SAISOKU.ID di Mobile & Desktop.
          </p>
        </div>

        {/* Proportional & Right-Aligned Compact Filters */}
        <div className="flex items-center gap-2.5 bg-slate-800 p-2 border-2 border-[var(--google-blue)] shadow-[2px_2px_0_#000] ml-auto w-full sm:w-auto justify-end">
          <div className="w-28 sm:w-32">
            <label className="block text-[8px] font-black text-slate-300 mb-0.5 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Filter className="w-2.5 h-2.5 text-[var(--google-blue)]" /> PERIODE
            </label>
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="px-1.5 py-1 text-[11px] font-extrabold bg-white text-black border-2 border-black h-7 rounded-none focus:outline-none w-full cursor-pointer font-sans"
            >
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Kuartal</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          <div className="w-36 sm:w-44">
            <label className="block text-[8px] font-black text-slate-300 mb-0.5 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Calendar className="w-2.5 h-2.5 text-[var(--google-blue)]" /> PILIH PERIODE
            </label>
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-1.5 py-1 text-[11px] font-extrabold bg-white text-black border-2 border-black h-7 rounded-none focus:outline-none w-full cursor-pointer font-sans"
            >
              {filterType === "monthly" &&
                MONTH_NAMES.map((name, idx) => {
                  const monthNum = String(idx + 1).padStart(2, "0");
                  return (
                    <option key={idx} value={`${currentYear}-${monthNum}`}>
                      {name} {currentYear}
                    </option>
                  );
                })}

              {filterType === "quarterly" && (
                <>
                  <option value={`${currentYear}-Q1`}>Q1 (Jan-Mar) {currentYear}</option>
                  <option value={`${currentYear}-Q2`}>Q2 (Apr-Jun) {currentYear}</option>
                  <option value={`${currentYear}-Q3`}>Q3 (Jul-Sep) {currentYear}</option>
                  <option value={`${currentYear}-Q4`}>Q4 (Okt-Des) {currentYear}</option>
                </>
              )}

              {filterType === "yearly" && (
                <>
                  <option value={String(currentYear)}>Tahun {currentYear}</option>
                  <option value={String(currentYear - 1)}>Tahun {currentYear - 1}</option>
                  <option value={String(currentYear - 2)}>Tahun {currentYear - 2}</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* METADATA 1: STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Debit / Pengeluaran */}
        <div className="insight-card p-3 border-l-5 border-l-[var(--google-red)]">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            TOTAL DEBIT (PENGELUARAN)
          </div>
          <div className="text-base font-black text-red-600">
            {formatIDR(totalDebit)}
          </div>
          <div className="text-[9px] font-bold text-red-600">
            {filteredTransactions.filter((t) => t.debit > 0).length} Transaksi
          </div>
        </div>

        {/* Total Credit / Pemasukan */}
        <div className="insight-card p-3 border-l-5 border-l-[var(--google-green)]">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            TOTAL KREDIT (PEMASUKAN)
          </div>
          <div className="text-base font-black text-green-600">
            {formatIDR(totalCredit)}
          </div>
          <div className="text-[9px] font-bold text-green-600">
            {filteredTransactions.filter((t) => t.credit > 0).length} Transaksi
          </div>
        </div>

        {/* Dynamic Net Balance Rule */}
        <div
          className={`insight-card p-3 border-l-5 transition-all duration-200 ${
            netBalance < 0
              ? "bg-red-600 border-l-red-900 text-white"
              : netBalance > 0
              ? "bg-green-600 border-l-green-900 text-white"
              : "bg-white dark:bg-slate-800 border-l-[var(--google-blue)] text-slate-900 dark:text-white"
          }`}
        >
          <div className={`text-[9px] font-extrabold uppercase tracking-wider mb-0.5 ${netBalance !== 0 ? "text-slate-100" : "text-slate-500"}`}>
            NET BALANCE (ARUS BERSIH)
          </div>
          <div className="text-base font-black">
            {netBalance < 0 ? formatIDR(0) : formatIDR(netBalance)}
          </div>
          <div className={`text-[9px] font-bold ${netBalance !== 0 ? "text-slate-100" : "text-slate-500"}`}>
            {netBalance < 0
              ? `Defisit / Minus (${formatIDR(netBalance)}) -> Ditampilkan Rp 0`
              : netBalance > 0
              ? "Status: Surplus / Untung (Positif)"
              : "Status: OK / Netral"}
          </div>
        </div>
      </div>

      {/* METADATA 2 & METADATA 3 BALANCED GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* METADATA 2: REKAP BULANAN JAN - DES */}
        <div className="insight-card p-3">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-black dark:border-slate-700">
            <h3 className="text-xs font-black uppercase">📅 METADATA 2: REKAP BULANAN JAN-DES</h3>
            <span className="insight-badge badge-blue text-[8px] py-0.5 px-1.5">12 BULAN</span>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-black text-slate-600 dark:text-slate-300">
                  <th className="py-1 px-1.5 text-left">Bulan</th>
                  <th className="py-1 px-1.5 text-right text-red-600 font-extrabold">Debit (Pengeluaran)</th>
                  <th className="py-1 px-1.5 text-right text-green-600 font-extrabold">Credit (Pemasukan)</th>
                </tr>
              </thead>
              <tbody>
                {MONTH_NAMES.map((mName, idx) => {
                  const d = monthlyMap[mName].debit;
                  const c = monthlyMap[mName].credit;
                  const isHighlighted = activeMonthIndices.includes(idx);

                  return (
                    <tr
                      key={mName}
                      className={`border-b border-slate-200 dark:border-slate-800 ${
                        isHighlighted ? "bg-blue-100 dark:bg-slate-700 font-black border-l-4 border-l-[var(--google-blue)]" : ""
                      }`}
                    >
                      <td className="py-1 px-1.5 font-bold flex items-center gap-1">
                        {mName}
                        {isHighlighted && (
                          <span className="insight-badge badge-blue text-[7px] py-0 px-1">AKTIF</span>
                        )}
                      </td>
                      <td className="py-1 px-1.5 text-right font-bold text-red-600">
                        {d > 0 ? formatIDR(d) : "-"}
                      </td>
                      <td className="py-1 px-1.5 text-right font-bold text-green-600">
                        {c > 0 ? formatIDR(c) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* METADATA 3: TOP 5 NILAI TRANSAKSI */}
        <div className="insight-card p-3">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-black dark:border-slate-700">
            <h3 className="text-xs font-black uppercase">🏆 METADATA 3: TOP 5 NILAI TRANSAKSI</h3>
            <span className="insight-badge badge-green text-[8px] py-0.5 px-1.5">TOP 5 NOMINAL</span>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-black text-slate-600 dark:text-slate-300">
                  <th className="py-1 px-1.5 text-left">No</th>
                  <th className="py-1 px-1.5 text-left">Deskripsi</th>
                  <th className="py-1 px-1.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {top5Transactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-500 font-bold">
                      Tidak ada transaksi pada periode filter ini.
                    </td>
                  </tr>
                ) : (
                  top5Transactions.map((t, idx) => {
                    const val = Math.max(t.debit, t.credit);
                    const isDebit = t.debit > t.credit;
                    return (
                      <tr key={t.id || idx} className="border-b border-slate-200 dark:border-slate-800">
                        <td className="py-1.5 px-1.5 font-black">#{idx + 1}</td>
                        <td className="py-1.5 px-1.5">
                          <div className="font-extrabold truncate max-w-[150px]">{t.description}</div>
                          <div className="text-[8px] text-slate-500 font-mono">
                            {t.journalNo} | {t.postDate}
                          </div>
                        </td>
                        <td
                          className={`py-1.5 px-1.5 text-right font-black ${
                            isDebit ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatIDR(val)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
