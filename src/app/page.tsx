"use client";

import React, { useEffect, useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("prospera_role");
    const savedSession = localStorage.getItem("prospera_session");
    if (savedRole && savedSession) {
      router.replace("/dashboard");
    } else {
      setIsMounted(true);
    }
  }, [router]);

  const handleLoginSuccess = (role: "admin" | "user", identifier: string) => {
    localStorage.setItem("prospera_role", role);
    localStorage.setItem("prospera_session", identifier);
    router.replace("/dashboard");
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
