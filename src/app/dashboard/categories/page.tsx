"use client";

import React, { useState, useEffect } from "react";
import { CategoriesView } from "@/components/CategoriesView";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";

export default function CategoriesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions()
      .then((data) => setTransactions(data))
      .catch((err) => {
        console.error("Failed to fetch transactions:", err);
        setError("Gagal memuat data transaksi.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-6 text-sm">Memuat...</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <CategoriesView
      transactions={transactions}
      customCategories={customCategories}
      setCustomCategories={setCustomCategories}
    />
  );
}