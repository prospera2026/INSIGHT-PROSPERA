"use client";

import React, { useState, useEffect } from "react";
import { DashboardView } from "@/components/DashboardView";
import { Transaction } from "@/lib/transactions";
import { fetchTransactions } from "@/lib/db";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTransactions().then((data) => setTransactions(data));
  }, []);

  return (
    <DashboardView
      transactions={transactions}
      onNavigateToTransactions={() => router.push("/dashboard/transactions")}
    />
  );
}
