"use client";

import React, { useState, useEffect } from "react";
import { CategoriesView } from "@/components/CategoriesView";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";

export default function CategoriesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchTransactions().then((data) => setTransactions(data));
  }, []);

  return (
    <CategoriesView
      transactions={transactions}
      customCategories={customCategories}
      setCustomCategories={setCustomCategories}
    />
  );
}
