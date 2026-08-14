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

export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Strict Financial Currency Parser (Indonesian 1.500.000,00 vs US 1,500,000.00)
export function parseCurrency(val: any): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str) return 0;

  // Format Indonesia: 1.500.000,00 (Dot ribuan, Comma desimal)
  if (str.includes(".") && str.includes(",")) {
    if (str.indexOf(".") < str.indexOf(",")) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length > 2) {
      str = str.replace(/\./g, "");
    } else if (parts[1].length === 3) {
      str = str.replace(/\./g, "");
    }
  } else if (str.includes(",")) {
    const parts = str.split(",");
    if (parts.length > 2) {
      str = str.replace(/,/g, "");
    } else if (parts[1].length === 3) {
      str = str.replace(/,/g, "");
    } else {
      str = str.replace(",", ".");
    }
  }

  const clean = str.replace(/[^0-9.-]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function autoCategorize(desc: string): string {
  if (!desc) return "Lain-lain / Operational";
  const upper = desc.toUpperCase();
  if (/\b(BIFAST|BY TRX BIFAST|BIFST)\b/.test(upper)) return "Biaya Bank / BIFAST";
  if (/\bPO-\d{4}/.test(upper) || /\b(PURCHASE ORDER|ORDER PO)\b/.test(upper)) return "Purchase Order (PO)";
  if (/\b(PADI|PADI UMKM|PADI 1TRX)\b/.test(upper)) return "PaDi UMKM / Inbound";
  if (/\b(NABUNG|SIMPANAN|TABUNGAN|TABUNG)\b/.test(upper)) return "Simpanan / Tabungan";
  if (/\b(TITIP BAYAR|TITIPAN BAYAR)\b/.test(upper)) return "Titip Bayar";
  if (/\b(LAPTOP HP|BELANJA LAPTOP|INVENTARIS LAPTOP|LAPTOP TIF)\b/.test(upper)) return "Inventaris / Belanja Laptop";
  return "Lain-lain / Operational";
}
