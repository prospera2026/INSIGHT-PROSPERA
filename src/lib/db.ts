"use client";

import { Transaction, autoCategorize, parseNumber } from "./transactions";
import { supabase } from "./supabaseClient";
import Papa from "papaparse";

const DB_KEY = "PROSPERA_LOCAL_TRANSACTIONS_V1";
const BUCKET_NAME = "csv-files";

// 1. Ambil Transaksi dari File CSV di Supabase Storage (atau LocalStorage jika offline)
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    // Cek daftar file di bucket Supabase Storage
    const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (!error && files && files.length > 0) {
      // Ambil file CSV terbaru
      const latestFile = files.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
      const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET_NAME).download(latestFile.name);

      if (!downloadError && blob) {
        const text = await blob.text();
        const parsedResults = Papa.parse(text, { header: true, skipEmptyLines: true });
        
        const mapped: Transaction[] = parsedResults.data.map((row: any, idx: number) => {
          const debit = parseNumber(row["Debit"] || row["debit"]);
          const credit = parseNumber(row["Credit"] || row["credit"]);
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
    console.warn("Supabase Storage fetch fallback to LocalStorage:", err);
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

// 2. Upload File CSV ke Supabase Storage Bucket (Hemat Quota DB)
export async function uploadCSVToStorage(file: File, parsedTransactions: Transaction[]): Promise<Transaction[]> {
  // Simpan instan di LocalStorage
  localStorage.setItem(DB_KEY, JSON.stringify(parsedTransactions));

  try {
    const fileName = `transactions_${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      console.warn("Peringatan Upload Supabase Storage:", error.message);
    }
  } catch (err) {
    console.error("Gagal upload ke Supabase Storage:", err);
  }

  return parsedTransactions;
}

// 3. Clear Storage & Local Database
export async function clearTransactions(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DB_KEY);
  }
  try {
    const { data: files } = await supabase.storage.from(BUCKET_NAME).list();
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name);
      await supabase.storage.from(BUCKET_NAME).remove(fileNames);
    }
  } catch (err) {
    console.error("Gagal hapus file di Supabase Storage:", err);
  }
}
