"use client";

import { Transaction } from "./transactions";
import { supabase } from "./supabaseClient";

const DB_KEY = "PROSPERA_LOCAL_TRANSACTIONS_V1";

// Ambil transaksi: Utamakan Supabase, jika offline/gagal gunakan LocalStorage fallback
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Map Supabase snake_case columns to Transaction model
      const mapped: Transaction[] = data.map((t: any) => ({
        id: t.id,
        postDate: t.post_date,
        valueDate: t.value_date || "-",
        branch: t.branch || "0989",
        journalNo: t.journal_no,
        description: t.description,
        debit: Number(t.debit) || 0,
        credit: Number(t.credit) || 0,
        category: t.category || "Lain-lain / Operational",
      }));
      // Sync local cache
      localStorage.setItem(DB_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase fetch fallback to LocalStorage:", err);
  }

  // LocalStorage Fallback
  return getLocalTransactions();
}

export function getLocalTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Gagal membaca data dari LocalStorage DB:", error);
    return [];
  }
}

// Simpan data transaksi baru ke Supabase & LocalStorage Database
export async function saveTransactions(newTransactions: Transaction[]): Promise<Transaction[]> {
  // 1. Simpan ke LocalStorage instan
  localStorage.setItem(DB_KEY, JSON.stringify(newTransactions));

  // 2. Sync / Insert Batch ke Supabase
  try {
    const rowsToInsert = newTransactions.map((t) => ({
      post_date: t.postDate,
      value_date: t.valueDate,
      branch: t.branch,
      journal_no: t.journalNo,
      description: t.description,
      debit: t.debit,
      credit: t.credit,
      category: t.category,
    }));

    const { error } = await supabase.from("transactions").insert(rowsToInsert);
    if (error) {
      console.warn("Peringatan insert Supabase:", error.message);
    }
  } catch (err) {
    console.error("Gagal sync ke Supabase:", err);
  }

  return newTransactions;
}

// Hapus seluruh data transaksi lokal & Supabase
export async function clearTransactions(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DB_KEY);
  }
  try {
    await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (err) {
    console.error("Gagal hapus data Supabase:", err);
  }
}
