"use client";

import { Transaction, autoCategorize, parseCurrency } from "./transactions";
import { supabase } from "./supabaseClient";
import Papa from "papaparse";

const DB_KEY = "PROSPERA_LOCAL_TRANSACTIONS_V1";
const BUCKET_NAME = "csv-files";

// Helper Date Parser
export function parseAndFormatDate(rawDate: string): string {
  if (!rawDate || rawDate === "-") return "-";
  const parts = rawDate.split(/[\/\s-]/);
  if (parts.length >= 3) {
    const d = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    let y = parts[2];
    if (y.length === 2) y = "20" + y;
    return `${d}/${m}/${y}`;
  }
  return rawDate;
}

// 1. Ambil Transaksi dari Database PostgreSQL Supabase Cloud (Fallback ke Storage & Local Storage)
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    // Priority 1: Ambil langsung dari Tabel PostgreSQL Supabase
    const { data: dbData, error: dbError } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!dbError && dbData && dbData.length > 0) {
      const mapped: Transaction[] = dbData.map((t: any, idx: number) => ({
        id: t.id || `db-${idx}`,
        postDate: t.post_date || "-",
        valueDate: t.value_date || "-",
        branch: t.branch || "0989",
        journalNo: t.journal_no || `J-${idx + 1000}`,
        description: t.description || "Transaksi Supabase DB",
        debit: parseFloat(t.debit) || 0,
        credit: parseFloat(t.credit) || 0,
        category: t.category || autoCategorize(t.description),
      }));

      localStorage.setItem(DB_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase DB Fetch note:", err);
  }

  try {
    // Priority 2: Unduh file CSV terbaru dari Supabase Storage Bucket
    const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (!error && files && files.length > 0) {
      const latestFile = files.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];
      const { data: blob, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(latestFile.name);

      if (!downloadError && blob) {
        const text = await blob.text();
        const parsedResults = Papa.parse(text, { header: true, skipEmptyLines: true });

        const mapped: Transaction[] = parsedResults.data.map((row: any, idx: number) => {
          const debit = parseCurrency(row["Debit"] || row["debit"]);
          const credit = parseCurrency(row["Credit"] || row["credit"]);
          const desc = row["Description"] || row["description"] || "Transaksi CSV";
          return {
            id: `tx-storage-${idx}`,
            postDate: row["Post Date"] || row["post_date"] || "-",
            valueDate: row["Value Date"] || row["value_date"] || "-",
            branch: row["Branch"] || row["branch"] || "0989",
            journalNo: row["Journal No."] || row["journal_no"] || `J-${idx + 1000}`,
            description: desc,
            debit,
            credit,
            category: autoCategorize(desc),
          };
        });

        localStorage.setItem(DB_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn("Supabase Storage fetch note:", err);
  }

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

// 2. Upload CSV & Direct Insert ke Database PostgreSQL Supabase Cloud
export async function uploadCSVToStorage(file: File, parsedTransactions: Transaction[]): Promise<Transaction[]> {
  localStorage.setItem(DB_KEY, JSON.stringify(parsedTransactions));

  try {
    // A. Insert langsung ke Tabel PostgreSQL Supabase Cloud
    const dbPayload = parsedTransactions.map((t) => ({
      post_date: t.postDate,
      value_date: t.valueDate,
      branch: t.branch,
      journal_no: t.journalNo,
      description: t.description,
      debit: t.debit,
      credit: t.credit,
      category: t.category,
    }));

    await supabase.from("transactions").insert(dbPayload);
  } catch (err) {
    console.warn("Direct Supabase DB Insert note:", err);
  }

  try {
    // B. Simpan berkas CSV fisik di Storage Bucket sebagai Arsip
    const fileName = `transactions_${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });
  } catch (err) {
    console.warn("Supabase Storage upload note:", err);
  }

  return parsedTransactions;
}

// 3. Clear Database di Supabase Cloud & Local Cache
export async function clearTransactions(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DB_KEY);
  }

  try {
    // Hapus seluruh baris di Tabel Database Supabase
    await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Hapus file CSV di Storage Bucket
    const { data: files } = await supabase.storage.from(BUCKET_NAME).list();
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name);
      await supabase.storage.from(BUCKET_NAME).remove(fileNames);
    }
  } catch (err) {
    console.error("Gagal hapus data Supabase Cloud:", err);
  }
}
