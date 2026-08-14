"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/lib/transactions";
import { Plus, CheckCircle2, Edit2, Trash2, Tag, Search, Filter, Database } from "lucide-react";

interface CategoriesViewProps {
  transactions: Transaction[];
  customCategories?: string[];
  setCustomCategories?: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  transactions,
}) => {
  const [categories, setCategories] = useState<string[]>([
    "Biaya Bank / BIFAST",
    "Purchase Order (PO)",
    "PaDi UMKM / Inbound",
    "Simpanan / Tabungan",
    "Inventaris / Belanja Laptop",
    "Titip Bayar",
    "Lain-lain / Operational",
  ]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination state (Max 6 rows per page like transactions)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const saved = localStorage.getItem("PROSPERA_CATEGORIES");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const saveCategories = (newList: string[]) => {
    setCategories(newList);
    localStorage.setItem("PROSPERA_CATEGORIES", JSON.stringify(newList));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (categories.includes(catName)) {
      alert("Kategori ini sudah ada!");
      return;
    }
    const updated = [...categories, catName];
    saveCategories(updated);
    setSuccessMsg(`Kategori "${catName}" berhasil ditambahkan!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setNewCategoryName("");
  };

  const handleEditCategory = (index: number) => {
    const oldName = categories[index];
    const newName = prompt("Edit nama kategori:", oldName);
    if (newName && newName.trim() !== "" && newName.trim() !== oldName) {
      const trimmed = newName.trim();
      if (categories.includes(trimmed)) {
        alert("Kategori dengan nama ini sudah ada!");
        return;
      }
      const updated = [...categories];
      updated[index] = trimmed;
      saveCategories(updated);
    }
  };

  const handleDeleteCategory = (index: number) => {
    const catName = categories[index];
    if (confirm(`Hapus kategori "${catName}"?`)) {
      const updated = categories.filter((_, idx) => idx !== index);
      saveCategories(updated);
    }
  };

  const handleResetDefault = () => {
    if (confirm("Kembalikan daftar kategori ke pengaturan awal sistem?")) {
      const defaults = [
        "Biaya Bank / BIFAST",
        "Purchase Order (PO)",
        "PaDi UMKM / Inbound",
        "Simpanan / Tabungan",
        "Inventaris / Belanja Laptop",
        "Titip Bayar",
        "Lain-lain / Operational",
      ];
      saveCategories(defaults);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Summary Metrics
  const totalUsedTransactions = transactions.filter((t) =>
    categories.includes(t.category)
  ).length;

  return (
    <div className="space-y-4">
      {/* SECTION 1: HEADER BANNER (Identik dengan Model Transactions) */}
      <div className="insight-card p-3 bg-slate-900 text-white border-2 border-black">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 pb-2 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block px-1.5 py-0.2 bg-[var(--google-blue)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
                DATABASE KATEGORI SISTEM
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight leading-tight">MANAJEMEN KATEGORI TRANSAKSI</h1>
            <p className="text-[10px] text-blue-300 font-bold">
              Master data tag kategori untuk pengelompokan laporan arus kas transaksi.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleResetDefault}
              className="insight-button insight-button--danger text-[10px] py-1 px-2.5 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> RESET DEFAULT
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-green-950 border-2 border-green-500 text-green-200 text-xs font-bold flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* Quick Rekap Summary (4 Kotak Identik) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-slate-400 uppercase">TOTAL KATEGORI</div>
            <div className="text-xs font-black text-white">{categories.length} Kategori</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-blue-400 uppercase">TRANSAKSI TERKAIT</div>
            <div className="text-xs font-black text-blue-400">{totalUsedTransactions} Items</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-green-400 uppercase">KATEGORI TERSARING</div>
            <div className="text-xs font-black text-green-400">{filteredCategories.length} Hasil</div>
          </div>

          <div className="p-2 bg-slate-800 border border-black">
            <div className="text-[8.5px] font-extrabold text-yellow-400 uppercase">STATUS STORAGE</div>
            <div className="text-xs font-black text-yellow-400">LocalStorage Active</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SEARCH & ADD CATEGORY BAR (Identik dengan Bar Filter Transactions) */}
      <div className="insight-card p-2 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kategori..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="insight-input pl-8 w-full py-1 text-xs font-sans"
          />
        </div>

        {/* Inline Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-full">
            <input
              type="text"
              placeholder="Nama kategori baru..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="insight-input py-1 px-2 text-xs font-sans w-full md:w-60"
            />
            <button
              type="submit"
              className="insight-button insight-button--success text-[10px] py-1 px-3 flex items-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> + TAMBAH
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: CATEGORIES DATA TABLE (Identik dengan Style Tabel Transactions) */}
      <div className="insight-card p-0 overflow-hidden mb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b-2 border-black uppercase text-[10px] font-extrabold font-sans">
                <th className="p-2 border-r border-slate-700 w-12 text-center">No</th>
                <th className="p-2 border-r border-slate-700">Nama Tag Kategori</th>
                <th className="p-2 border-r border-slate-700 text-center w-36">Tipe Master</th>
                <th className="p-2 border-r border-slate-700 text-center w-36">Total Transaksi Terkait</th>
                <th className="p-2 text-center w-40">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--insight-border)] font-mono text-[11px]">
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 font-bold font-sans">
                    Tidak ada kategori yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((c, idx) => {
                  const originalIndex = categories.indexOf(c);
                  const count = transactions.filter((t) => t.category === c).length;
                  return (
                    <tr key={c || idx} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <td className="p-2 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700">
                        {startIndex + idx + 1}
                      </td>
                      <td className="p-2 font-extrabold font-sans text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[var(--google-blue)]" />
                          <span>{c}</span>
                        </div>
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700 font-sans">
                        <span className="insight-badge badge-blue text-[9px] py-0.5 px-2">
                          System Master
                        </span>
                      </td>
                      <td className="p-2 text-center font-bold font-sans border-r border-slate-200 dark:border-slate-700">
                        <span className="insight-badge badge-green text-[9px] py-0.5 px-2 font-mono">
                          {count} Data Trx
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-sans">
                          <button
                            onClick={() => handleEditCategory(originalIndex)}
                            className="px-2 py-0.5 bg-[var(--google-blue)] text-white text-[9px] font-extrabold border border-black shadow-[1px_1px_0_#000] hover:bg-blue-600 flex items-center gap-1 uppercase"
                          >
                            <Edit2 className="w-2.5 h-2.5" /> EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(originalIndex)}
                            className="px-2 py-0.5 bg-[var(--google-red)] text-white text-[9px] font-extrabold border border-black shadow-[1px_1px_0_#000] hover:bg-red-600 flex items-center gap-1 uppercase"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> HAPUS
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: PAGINATION CONTROLS (Identik dengan Pagination 6 Data Transactions) */}
      <div className="insight-card p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300 font-sans">
          Menampilkan{" "}
          <span className="text-[var(--google-blue)] font-mono">
            {totalItems > 0 ? `${startIndex + 1} - ${endIndex}` : "0 - 0"}
          </span>{" "}
          dari {totalItems} Kategori (Max 6/hal)
        </div>
        <div className="flex items-center gap-1.5 font-sans">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="insight-button text-[10px] py-1 px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← SEBELUMNYA
          </button>
          <span className="insight-badge badge-blue text-[10px] py-1 px-2 font-mono">
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
    </div>
  );
};
