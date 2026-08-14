"use client";

import React, { useState, useEffect } from "react";
import { TransactionsView } from "@/components/TransactionsView";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTransactions().then((data) => setTransactions(data));
    const saved = localStorage.getItem("PROSPERA_CATEGORIES");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomCategories(parsed);
      } catch (e) {}
    }
  }, []);

  return (
    <TransactionsView
      transactions={transactions}
      setTransactions={setTransactions}
      onNavigateToDashboard={() => router.push("/dashboard")}
      customCategories={customCategories}
    />
  );
}
