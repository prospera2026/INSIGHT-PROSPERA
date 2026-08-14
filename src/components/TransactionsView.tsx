"use client";

import React, { useState } from "react";
import { Transaction, autoCategorize, parseNumber } from "@/lib/transactions";
import { uploadCSVToStorage, clearTransactions } from "@/lib/db";
import { UploadCloud, Search, Filter, CheckCircle2, FileUp, Trash2, Database, Eye, X } from "lucide-react";
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

  // State untuk Pop-up Detail Transaksi (View Data)
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // CSV File Upload Handler dengan LocalStorage Database Persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: Transaction[] = results.data.map((row: any, idx: number) => {
          const debit = parseNumber(row["Debit"] || row["debit"]);
          const credit = parseNumber(row["Credit"] || row["credit"]);
          const desc = row["Description"] || row["description"] || "Transaksi CSV";
          return {
            id: `tx-${Date.now()}-${idx}`,
            postDate: row["Post Date"] || row["post_date"] || new Date().toLocaleString("id-ID"),
            valueDate: row["Value Date"] || row["value_date"] || "-",
            branch: row["Branch"] || row["branch"] || "0989",
            journalNo: row["Journal No."] || row["journal_no"] || `J-${idx + 1000}`,
            description: desc,
            debit,
            credit,
            category: autoCategorize(desc),
          };
        });

        if (parsed.length > 0) {
          // Upload berkas CSV ke Supabase Storage Bucket (Hemat Quota DB)
          uploadCSVToStorage(file, parsed).then((savedData) => {
            setTransactions(savedData);
            setUploadSuccessMessage(`Berhasil mengunggah file "${file.name}" ke Supabase Storage Cloud (${parsed.length} baris parsed)!`);
            setTimeout(() => setUploadSuccessMessage(null), 5000);
          });
        }
      },
    });
  };

  // Reset Database
  const handleClearDatabase = async () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh data transaksi dari Database Supabase & Local Storage?")) {
      await clearTransactions();
      setTransactions([]);
    }
  };

  // Filtering Logic
  const allCategories = Array.from(new Set([...transactions.map((t) => t.category), ...customCategories]));

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.journalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.postDate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate filtered Rekap metrics
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
    <div className="space-y-6">
      {/* SECTION 1: TOP UPLOADER & REKAP BAR */}
      <div className="insight-card p-3 bg-slate-900 text-white border-2 border-black">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 pb-2 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block px-1.5 py-0.2 bg-[var(--google-green)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
                DATABASE LOKAL TERSIMPAN
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight leading-tight">DATABASE TRANSAKSI & UPLOAD CSV</h1>
            <p className="text-[10px] text-blue-300 font-bold">
              Data tersimpan otomatis di LocalStorage browser sebelum dikoneksikan ke Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {transactions.length > 0 && (
              <button
                onClick={handleClearDatabase}
                className="insight-button insight-button--danger text-[10px] py-1 px-2.5 flex items-center gap-1"
                title="Hapus Database Lokal"
              >
                <Trash2 className="w-3 h-3" /> RESET DB
              </button>
            )}

            {/* Upload Button */}
            <label className="insight-button insight-button--primary cursor-pointer text-[10px] py-1 px-2.5 flex items-center gap-1.5 whitespace-nowrap">
              <UploadCloud className="w-3.5 h-3.5" /> UPLOAD BENCHMARK CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {uploadSuccessMessage && (
          <div className="p-3 bg-green-950 border-2 border-green-500 text-green-200 text-xs font-bold flex items-center justify-between mb-4">
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

        {/* Quick Rekap Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-2">
          <div className="p-2.5 bg-slate-800 border-2 border-black">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase">TOTAL TRANSAKSI DB</div>
            <div className="text-sm font-black text-white">{filteredTransactions.length} Items</div>
          </div>

          <div className="p-2.5 bg-slate-800 border-2 border-black">
            <div className="text-[9px] font-extrabold text-red-400 uppercase">REKAP DEBIT (PENGELUARAN)</div>
            <div className="text-sm font-black text-red-400">{formatIDR(totalFilteredDebit)}</div>
          </div>

          <div className="p-2.5 bg-slate-800 border-2 border-black">
            <div className="text-[9px] font-extrabold text-green-400 uppercase">REKAP KREDIT (PEMASUKAN)</div>
            <div className="text-sm font-black text-green-400">{formatIDR(totalFilteredCredit)}</div>
          </div>

          <div className="p-2.5 bg-slate-800 border-2 border-black">
            <div className="text-[9px] font-extrabold text-blue-400 uppercase">NET ARUS TERFILTER</div>
            <div className="text-sm font-black text-blue-400">{formatIDR(netFilteredBalance)}</div>
          </div>
        </div>
      </div>

      {/* DRAG AND DROP EMPTY STATE IF NO DATA */}
      {transactions.length === 0 && (
        <div className="insight-card p-12 text-center border-4 border-dashed border-[var(--google-blue)] bg-slate-50 dark:bg-slate-900/50">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 border-3 border-black mx-auto flex items-center justify-center mb-4 shadow-[4px_4px_0_#000]">
            <Database className="w-8 h-8 text-[var(--google-blue)]" />
          </div>
          <h2 className="text-lg font-black uppercase mb-1">DATABASE LOKAL KOSONG</h2>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mb-6">
            Unggah file mutasi `.csv` bank Anda. Data yang diunggah akan otomatis tersimpan permanen di Database Browser lokal Anda.
          </p>
          <label className="insight-button insight-button--primary cursor-pointer text-xs">
            <UploadCloud className="w-4 h-4" /> UPLOAD TRANSC
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* SECTION 2: SEARCH & FILTER ACTION BAR */}
      {transactions.length > 0 && (
        <>
          <div className="insight-card p-3 flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari deskripsi, No Jurnal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="insight-input pl-9 w-full py-1.5 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Filter Category Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[var(--google-blue)]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="insight-input font-bold text-xs uppercase py-1.5"
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

          {/* SECTION 3: TRANSACTIONS DATA TABLE */}
          <div className="insight-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white border-b-3 border-black uppercase text-[10.5px] font-extrabold tracking-wider">
                    <th className="p-3 border-r border-slate-700">Tanggal Post</th>
                    <th className="p-3 border-r border-slate-700">No. Jurnal</th>
                    <th className="p-3 border-r border-slate-700">Kategori Tag</th>
                    <th className="p-3 border-r border-slate-700">Deskripsi Transaksi</th>
                    <th className="p-3 border-r border-slate-700 text-right">Debit (Pengeluaran)</th>
                    <th className="p-3 border-r border-slate-700 text-right">Credit (Pemasukan)</th>
                    <th className="p-3 text-center">Aksi Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--insight-border)] font-mono">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                        Tidak ada data transaksi yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="p-2.5 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          {t.postDate}
                        </td>
                        <td className="p-2.5 font-extrabold border-r border-slate-200 dark:border-slate-700">
                          {t.journalNo}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                          <span
                            className={`insight-badge ${
                              t.category.includes("BIFAST")
                                ? "insight-badge--yellow"
                                : t.category.includes("PO")
                                ? "insight-badge--blue"
                                : t.category.includes("PaDi")
                                ? "insight-badge--green"
                                : "insight-badge--red"
                            }`}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-sans text-xs max-w-xs truncate font-medium">
                          {t.description}
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-red-600 border-r border-slate-200 dark:border-slate-700">
                          {t.debit > 0 ? formatIDR(t.debit) : "-"}
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-green-600 border-r border-slate-200 dark:border-slate-700">
                          {t.credit > 0 ? formatIDR(t.credit) : "-"}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => setSelectedTxDetail(t)}
                            className="px-2 py-1 bg-[var(--google-blue)] text-white text-[10px] font-extrabold border border-black shadow-[1.5px_1.5px_0_#000] hover:bg-blue-600 flex items-center gap-1 mx-auto uppercase"
                          >
                            <Eye className="w-3 h-3" /> VIEW DATA
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer summary */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t-3 border-[var(--insight-border)] flex justify-between items-center text-xs font-bold">
              <span>Menampilkan {filteredTransactions.length} dari {transactions.length} baris data</span>
              <span className="font-mono text-[var(--google-blue)]">Indexed Storage: LocalStorage</span>
            </div>
          </div>
        </>
      )}

      {/* POP-UP DETAIL TRANSAKSI (VIEW DATA) */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="insight-card w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden insight-page-fade">
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 border-b-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[var(--google-blue)]" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  DETAIL DATA TRANSAKSI
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 hover:bg-slate-800 border border-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">NO. JURNAL</div>
                  <div className="text-sm font-black">{selectedTxDetail.journalNo}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">TANGGAL POST</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedTxDetail.postDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">BRANCH / CABANG</div>
                  <div className="text-xs font-bold">{selectedTxDetail.branch}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">KATEGORI TRANSAKSI</div>
                  <span className="insight-badge insight-badge--blue mt-1">
                    {selectedTxDetail.category}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">DESKRIPSI LENGKAP MUTASI</div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-black font-sans text-xs font-semibold leading-relaxed">
                  {selectedTxDetail.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-500">
                  <div className="text-[9px] font-extrabold text-red-500 uppercase">NOMINAL DEBIT (KELUAR)</div>
                  <div className="text-base font-black text-red-600">
                    {selectedTxDetail.debit > 0 ? formatIDR(selectedTxDetail.debit) : "Rp 0"}
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/40 border-2 border-green-500">
                  <div className="text-[9px] font-extrabold text-green-500 uppercase">NOMINAL KREDIT (MASUK)</div>
                  <div className="text-base font-black text-green-600">
                    {selectedTxDetail.credit > 0 ? formatIDR(selectedTxDetail.credit) : "Rp 0"}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t-4 border-black flex justify-end">
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="insight-button insight-button--primary text-xs"
              >
                TUTUP DETAIL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
