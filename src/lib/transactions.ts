export interface Transaction {
  id: string;
  postDate: string;
  valueDate: string;
  branch: string;
  journalNo: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
}

// Mulai dengan data kosong agar murni mengandalkan upload CSV
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export function autoCategorize(desc: string): string {
  if (!desc) return "Lain-lain / Operational";
  const upper = desc.toUpperCase();
  if (upper.includes("BIFAST")) return "Biaya Bank / BIFAST";
  if (upper.includes("PADI")) return "PaDi UMKM / Inbound";
  if (upper.includes("PO-")) return "Purchase Order (PO)";
  if (upper.includes("NABUNG") || upper.includes("SIMPANAN")) return "Simpanan / Tabungan";
  if (upper.includes("TITIP BAYAR")) return "Titip Bayar";
  if (upper.includes("LAPTOP")) return "Inventaris / Belanja Laptop";
  return "Lain-lain / Operational";
}

export function parseNumber(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
