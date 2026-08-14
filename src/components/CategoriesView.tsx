"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/lib/transactions";
import { Plus, CheckCircle2, Edit2, Trash2 } from "lucide-react";

interface CategoriesViewProps {
  transactions: Transaction[];
  customCategories: string[];
  setCustomCategories: React.Dispatch<React.SetStateAction<string[]>>;
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="insight-card p-4 bg-slate-900 text-white border-3 border-black">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block px-1.5 py-0.2 bg-[var(--google-blue)] text-white text-[8.5px] font-extrabold tracking-wider uppercase border border-black">
            MANAJEMEN KATEGORI
          </span>
        </div>
        <h1 className="text-base font-black tracking-tight">MANAJEMEN KATEGORI TRANSAKSI</h1>
        <p className="text-[11px] text-slate-300 font-medium mt-0.5">
          Kelola, edit, dan hapus kategori pengelompokan laporan transaksi.
        </p>
      </div>

      {/* Form Tambah Kategori Baru */}
      <div className="insight-card p-4">
        <h3 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[var(--google-blue)]" /> TAMBAH KATEGORI BARU
        </h3>

        {successMsg && (
          <div className="p-2.5 bg-green-100 border-2 border-green-500 text-green-700 text-xs font-bold flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Nama kategori baru..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="insight-input flex-1 py-1.5 text-xs"
          />
          <button
            type="submit"
            className="insight-button insight-button--success text-xs py-1.5 px-3 whitespace-nowrap"
          >
            + SIMPAN
          </button>
        </form>
      </div>

      {/* Daftar Kategori System dengan Edit & Delete */}
      <div className="insight-card p-4">
        <h3 className="text-xs font-black uppercase tracking-wider mb-3 pb-2 border-b-2 border-black dark:border-slate-700">
          DAFTAR KATEGORI SYSTEM ({categories.length})
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map((c, idx) => {
            const count = transactions.filter((t) => t.category === c).length;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border-2 border-black shadow-[2px_2px_0_#000] max-w-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black">🏷️ {c}</span>
                  <span className="insight-badge badge-blue text-[8px] py-0.5 px-1.5">
                    {count} Transaksi
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEditCategory(idx)}
                    className="insight-button insight-button--primary text-[9px] py-1 px-2 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> EDIT
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(idx)}
                    className="insight-button insight-button--danger text-[9px] py-1 px-2 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> HAPUS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
