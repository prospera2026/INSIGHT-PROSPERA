"use client";

import React, { useState } from "react";
import { Transaction, autoCategorize, parseCurrency } from "@/lib/transactions";
import { uploadCSVToStorage, clearTransactions } from "@/lib/db";
import { UploadCloud, Search, Filter, CheckCircle2, Trash2, Database, Eye, X } from "lucide-react";
import Papa from "papaparse";

interface TransactionsViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onNavigateToDashboard: () => void;
  customCategories: string[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  setTransactions,
  onNavigateToDashboard,
  customCategories,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Pagination state (Max 6 rows per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: Transaction[] = [];

        results.data.forEach((row: any, idx: number) => {
          const debit = parseCurrency(row["Debit"] || row["debit"]);
          const credit = parseCurrency(row["Credit"] || row["credit"]);
          const desc = row["Description"] || row["description"];
          const journalNo = row["Journal No."] || row["journal_no"];

          if (!desc && !journalNo && debit === 0 && credit === 0) return;

          parsed.push({
            id: `tx-${Date.now()}-${idx}`,
            postDate: row["Post Date"] || row["post_date"] || "-",
            valueDate: row["Value Date"] || row["value_date"] || "-",
            branch: row["Branch"] || row["branch"] || "0989",
            journalNo: journalNo || `J-${idx + 1000}`,
            description: desc || "Transaksi CSV",
            debit,
            credit,
            category: autoCategorize(desc),
          });
        });

        if (parsed.length > 0) {
          // Gabungkan data baru dengan data yang sudah ada sebelumnya
          const combined = [...transactions, ...parsed];
          uploadCSVToStorage(file, combined).then((savedData) => {
            setTransactions(savedData);
            setUploadSuccessMessage(`Berhasil menambahkan ${parsed.length} baris data dari file "${file.name}"! Total data: ${savedData.length}`);
            setTimeout(() => setUploadSuccessMessage(null), 5000);
          });
        }
      },
    });
  };

  const handleClearDatabase = async () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh data transaksi dari Database Supabase Cloud?")) {
      await clearTransactions();
      setTransactions([]);
    }
  };

  const allCategories = Array.from(new Set([...transactions.map((t) => t.category), ...customCategories]));

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.journalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.postDate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const totalFilteredDebit = filteredTransactions.reduce((acc, t) => acc + t.debit, 0);
  const totalFilteredCredit = filteredTransactions.reduce((acc, t) => acc + t.credit, 0);
  const netFilteredBalance = totalFilteredCredit - totalFilteredDebit;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-4">
      {/* HEADER BANNER */}
      <div className="insight-card p-3 bg-slate-900 text-white border-2 border-black">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 pb-2 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block px-1.5 py-0.2 bg-[var(--google-green)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
                SUPABASE DATABASE CLOUD
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight leading-tight">DATABASE TRANSAKSI & UPLOAD CSV</h1>
            <p className="text-[10px] text-blue-300 font-bold">
              Tersimpan permanen di Supabase Cloud Database & Storage.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {transactions.length > 0 && (
              <button
                onClick={handleClearDatabase}
                className="insight-button insight-button--danger text-[10px] py-1 px-2.5 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> RESET DB
              </button>
            )}

            <label className="insight-button insight-button--primary cursor-pointer text-[10px] py-1 px-2.5 flex items-center gap-1.5 whitespace-nowrap">
              <UploadCloud className="w-3.5 h-3.5" /> UPLOAD BENCHMARK CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {uploadSuccessMessage && (
          <div className="p-2.5 bg-green-950 border-2 border-green-500 text-green-200 text-xs font-bold flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>{uploadSuccessMessage}</span>
            </div>
            <button
              onClick={onNavigateToDashboard}
              className="px-2 py-1 bg-green-500 text-black font-extrabold text-[10px] uppercase border border-black hover:bg-green-400"
            >
              LIHAT DASHBOARD →
            </button>
          </div>
        )}

        {/* Quick Rekap Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-slate-400 uppercase">TOTAL TRANSAKSI</div>
            <div className="text-xs font-black text-white">{filteredTransactions.length} Items</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-red-400 uppercase">REKAP DEBIT</div>
            <div className="text-xs font-black text-red-400">{formatIDR(totalFilteredDebit)}</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-green-400 uppercase">REKAP KREDIT</div>
            <div className="text-xs font-black text-green-400">{formatIDR(totalFilteredCredit)}</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-blue-400 uppercase">NET ARUS</div>
            <div className="text-xs font-black text-blue-400">{formatIDR(netFilteredBalance)}</div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {transactions.length === 0 && (
        <div className="insight-card p-8 text-center border-4 border-dashed border-[var(--google-blue)] bg-slate-50 dark:bg-slate-900/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 border-2 border-black mx-auto flex items-center justify-center mb-3 shadow-[2px_2px_0_#000]">
            <Database className="w-6 h-6 text-[var(--google-blue)]" />
          </div>
          <h2 className="text-sm font-black uppercase mb-1">DATABASE SUPABASE KOSONG</h2>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mb-4">
            Unggah file mutasi `.csv` bank Anda. Data akan tersimpan secara otomatis di Supabase Cloud.
          </p>
          <label className="insight-button insight-button--primary cursor-pointer text-xs">
            <UploadCloud className="w-4 h-4" /> UPLOAD CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {transactions.length > 0 && (
        <>
          {/* SEARCH & FILTER BAR */}
          <div className="insight-card p-2 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari deskripsi, No Jurnal..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="insight-input pl-8 w-full py-1 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[var(--google-blue)]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="insight-input font-bold text-xs uppercase py-1"
                >
                  <option value="ALL">SEMUA KATEGORI ({transactions.length})</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="insight-card p-0 overflow-hidden mb-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white border-b-2 border-black uppercase text-[10px] font-extrabold">
                    <th className="p-2 border-r border-slate-700">Tanggal Post</th>
                    <th className="p-2 border-r border-slate-700">No. Jurnal</th>
                    <th className="p-2 border-r border-slate-700">Kategori</th>
                    <th className="p-2 border-r border-slate-700">Deskripsi</th>
                    <th className="p-2 border-r border-slate-700 text-right">Debit</th>
                    <th className="p-2 border-r border-slate-700 text-right">Credit</th>
                    <th className="p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--insight-border)] font-mono text-[11px]">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-bold">
                        Tidak ada data transaksi yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-2 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          {t.postDate}
                        </td>
                        <td className="p-2 font-extrabold border-r border-slate-200 dark:border-slate-700">
                          {t.journalNo}
                        </td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                          <span className="insight-badge badge-blue text-[9px] py-0.5 px-1.5">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-sans max-w-xs truncate font-medium">
                          {t.description}
                        </td>
                        <td className="p-2 text-right font-extrabold text-red-600 border-r border-slate-200 dark:border-slate-700">
                          {t.debit > 0 ? formatIDR(t.debit) : "-"}
                        </td>
                        <td className="p-2 text-right font-extrabold text-green-600 border-r border-slate-200 dark:border-slate-700">
                          {t.credit > 0 ? formatIDR(t.credit) : "-"}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => setSelectedTxDetail(t)}
                            className="px-2 py-0.5 bg-[var(--google-blue)] text-white text-[9px] font-extrabold border border-black shadow-[1px_1px_0_#000] hover:bg-blue-600 flex items-center gap-1 mx-auto uppercase"
                          >
                            <Eye className="w-3 h-3" /> VIEW
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION CONTROLS (MAX 6 DATA PER HALAMAN) */}
          <div className="insight-card p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300">
              Menampilkan{" "}
              <span className="text-[var(--google-blue)]">
                {totalItems > 0 ? `${startIndex + 1} - ${endIndex}` : "0 - 0"}
              </span>{" "}
              dari {totalItems} transaksi (Max 6/hal)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="insight-button text-[10px] py-1 px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← SEBELUMNYA
              </button>
              <span className="insight-badge badge-blue text-[10px] py-1 px-2">
                Hal {safeCurrentPage} / {totalPages}
              </span>
              <button
                disabled={safeCurrentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="insight-button text-[10px] py-1 px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SELANJUTNYA →
              </button>
            </div>
          </div>
        </>
      )}

      {/* POP-UP DETAIL TRANSAKSI */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="insight-card w-full max-w-lg bg-white dark:bg-slate-900 border-3 border-black shadow-[6px_6px_0_#000] overflow-hidden">
            <div className="bg-slate-900 text-white p-3 border-b-3 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--google-blue)]" />
                <h3 className="font-black text-xs uppercase tracking-wide">
                  DETAIL DATA TRANSAKSI
                </h3>
              </div>
              <button onClick={() => setSelectedTxDetail(null)} className="p-1 hover:bg-slate-800 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">NO. JURNAL</div>
                  <div className="text-xs font-black">{selectedTxDetail.journalNo}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">TANGGAL POST</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedTxDetail.postDate}</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">DESKRIPSI LENGKAP MUTASI</div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-black font-sans text-xs font-semibold leading-relaxed">
                  {selectedTxDetail.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-500">
                  <div className="text-[8.5px] font-extrabold text-red-500 uppercase">DEBIT (KELUAR)</div>
                  <div className="text-sm font-black text-red-600">
                    {selectedTxDetail.debit > 0 ? formatIDR(selectedTxDetail.debit) : "Rp 0"}
                  </div>
                </div>

                <div className="p-2 bg-green-50 dark:bg-green-950/40 border border-green-500">
                  <div className="text-[8.5px] font-extrabold text-green-500 uppercase">KREDIT (MASUK)</div>
                  <div className="text-sm font-black text-green-600">
                    {selectedTxDetail.credit > 0 ? formatIDR(selectedTxDetail.credit) : "Rp 0"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-t-3 border-black flex justify-end">
              <button onClick={() => setSelectedTxDetail(null)} className="insight-button insight-button--primary text-xs">
                TUTUP DETAIL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
