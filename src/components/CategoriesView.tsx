"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/transactions";
import { Tag, Plus, CheckCircle2, Shield } from "lucide-react";

interface CategoriesViewProps {
  transactions: Transaction[];
  customCategories: string[];
  setCustomCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  transactions,
  customCategories,
  setCustomCategories,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // System Default Categories
  const systemCategories = [
    "Biaya Bank / BIFAST",
    "Purchase Order (PO)",
    "PaDi UMKM / Inbound",
    "Simpanan / Tabungan",
    "Titip Bayar",
    "Inventaris / Belanja Laptop",
    "Lain-lain / Operational"
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (!customCategories.includes(catName) && !systemCategories.includes(catName)) {
      setCustomCategories([...customCategories, catName]);
      setSuccessMsg(`Kategori "${catName}" berhasil ditambahkan!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    setNewCategoryName("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="insight-card p-4 bg-slate-900 text-white border-3 border-black">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block px-1.5 py-0.2 bg-[var(--google-blue)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
            KONTROL KATEGORI
          </span>
        </div>
        <h1 className="text-base font-black tracking-tight">MANAJEMEN KATEGORI TRANSAKSI</h1>
        <p className="text-[10px] text-slate-300 font-medium mt-0.5">
          Kelola tag daftar kategori transaksi yang digunakan untuk pengelompokan laporan keuangan.
        </p>
      </div>

      {/* Form Tambah Kategori Baru */}
      <div className="insight-card p-5">
        <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[var(--google-blue)]" /> TAMBAH KATEGORI TRANSAKSI BARU
        </h3>

        {successMsg && (
          <div className="p-3 bg-green-100 border-2 border-green-500 text-green-700 text-xs font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Masukkan Nama Kategori (contoh: Operasional Cabang, Gaji, dll)..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="insight-input flex-1 py-2 text-xs"
          />
          <button
            type="submit"
            className="insight-button insight-button--primary text-xs py-2 px-4 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> SIMPAN KATEGORI
          </button>
        </form>
      </div>

      {/* Daftar Kategori Sistem & Kategori Kustom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kategori Bawaan Sistem */}
        <div className="insight-card p-5">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--google-green)]" /> KATEGORI BAWAAN SISTEM ({systemCategories.length})
          </h3>
          <div className="space-y-2">
            {systemCategories.map((cat) => {
              const count = transactions.filter((t) => t.category === cat).length;
              return (
                <div key={cat} className="p-3 border-2 border-black bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-500" /> {cat}
                  </span>
                  <span className="insight-badge insight-badge--blue text-[9px]">{count} Transaksi</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kategori Kustom Tambahan */}
        <div className="insight-card p-5">
          <h3 className="text-xs font-black uppercase tracking-wider mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--google-blue)]" /> KATEGORI TAMBAHAN ANDA ({customCategories.length})
          </h3>
          {customCategories.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 text-slate-400 font-bold text-xs">
              Belum ada kategori kustom tambahan yang dibuat.
            </div>
          ) : (
            <div className="space-y-2">
              {customCategories.map((cat) => {
                const count = transactions.filter((t) => t.category === cat).length;
                return (
                  <div key={cat} className="p-3 border-2 border-black bg-white dark:bg-slate-900 flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[var(--google-blue)]" /> {cat}
                    </span>
                    <span className="insight-badge insight-badge--green text-[9px]">{count} Transaksi</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
