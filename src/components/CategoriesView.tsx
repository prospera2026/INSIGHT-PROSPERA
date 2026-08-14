"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/lib/transactions";
import { Plus, CheckCircle2, Edit2, Trash2, Tag, Layers } from "lucide-react";

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="insight-card p-3.5 bg-slate-900 text-white border-3 border-black">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block px-1.5 py-0.2 bg-[var(--google-blue)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
            MANAJEMEN KATEGORI
          </span>
        </div>
        <h1 className="text-sm font-black tracking-tight leading-tight">MANAJEMEN KATEGORI TRANSAKSI</h1>
        <p className="text-[10.5px] text-slate-300 font-medium mt-0.5">
          Kelola, edit, dan sesuaikan tag kategori pengelompokan laporan arus kas transaksi.
        </p>
      </div>

      {/* Grid Split: Form Tambah (Kiri) & Daftar Kategori (Kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Kolom Kiri: Form Input & Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="insight-card p-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[var(--google-blue)]" /> TAMBAH KATEGORI
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mb-3">
              Kategori baru akan langsung dapat digunakan untuk memfilter transaksi.
            </p>

            {successMsg && (
              <div className="p-2 bg-green-100 dark:bg-green-950/50 border-2 border-green-500 text-green-800 dark:text-green-200 text-xs font-bold flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-2">
              <input
                type="text"
                placeholder="Contoh: Operasional, Gaji, Vendor..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="insight-input w-full py-1.5 px-2 text-xs font-sans"
              />
              <button
                type="submit"
                className="insight-button insight-button--success w-full text-xs py-1.5 justify-center gap-1 font-sans"
              >
                <Plus className="w-3.5 h-3.5" /> SIMPAN KATEGORI
              </button>
            </form>
          </div>

          <div className="insight-card p-3 bg-slate-100 dark:bg-slate-800/80 border-2 border-black">
            <div className="flex items-center gap-1.5 text-xs font-black mb-1">
              <Layers className="w-3.5 h-3.5 text-[var(--google-blue)]" /> TOTAL KATEGORI AKTIF
            </div>
            <div className="text-xl font-black text-[var(--google-blue)] font-mono">
              {categories.length} <span className="text-xs text-slate-500 font-sans">Kategori Terdaftar</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Grid Card Daftar Kategori (2 Kolom Rapi) */}
        <div className="md:col-span-7">
          <div className="insight-card p-3.5 min-h-[360px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black dark:border-slate-700">
                <h3 className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--google-blue)]" /> DAFTAR KATEGORI SYSTEM
                </h3>
                <span className="insight-badge badge-blue text-[8px] py-0.5 px-1.5 font-mono">
                  {categories.length} ITEMS
                </span>
              </div>

              {/* Responsive 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((c, idx) => {
                  const count = transactions.filter((t) => t.category === c).length;
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-white dark:bg-slate-800 border-2 border-black shadow-[2px_2px_0_#000] flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-black font-sans leading-snug line-clamp-1">
                          🏷️ {c}
                        </span>
                        <span className="insight-badge badge-blue text-[7.5px] py-0 px-1 whitespace-nowrap font-mono">
                          {count} Trx
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleEditCategory(idx)}
                          className="insight-button insight-button--primary text-[8.5px] py-0.5 px-1.5 flex items-center gap-0.5 font-sans"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(idx)}
                          className="insight-button insight-button--danger text-[8.5px] py-0.5 px-1.5 flex items-center gap-0.5 font-sans"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> HAPUS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
