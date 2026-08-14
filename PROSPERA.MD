prospera
Sistem dashboard keuangan untuk SAISOKU.ID yang mengelola data transaksi, pemrosesan CSV, dan pemantauan arus kas.

Instructions
PROSPERA Dashboard Documentation
Overview
PROSPERA adalah aplikasi dashboard manajemen keuangan berbasis web yang dirancang khusus untuk memproses, menganalisis, dan memvisualisasikan data transaksi perbankan.

Tech Stack
Framework Next.js 15 (App Router)
Language TypeScript
Styling Tailwind CSS
Components shadcnui
Data Table TanStack Table (v8)
Data Parsing PapaParse
DatabaseBackend Supabase (PostgreSQL)
Core Features
Financial Dashboard
Visualisasi arus kas (Recharts).
Ringkasan statistik (Total Debit, Total Credit, Net Balance).
Transaction Manager
CSV Upload & Parser.
Tabel interaktif dengan filtering, sorting, dan pagination.
User Access Control
Role management (Admin, Karyawan, Anggota).
Proteksi data simpanan (fitur sensor untuk akun non-aktif).
Database Schema (PostgreSQL)
profiles id, full_name, role (admin, employee, member), status (active, inactive)
transactions id, post_date, journal_no, description, debit, credit, created_at
Development Guidelines
Semua update kode harus merujuk pada DB SAISOKU ver.1 patch files.
Gunakan Next.js Server Components untuk pemrosesan data sensitif.
Terapkan validasi ketat pada input data transaksi dari CSV.
Folder Structure
src
  app
    dashboard
    apitransactions
  components
    ui (shadcn)
    dashboard (charts, summary cards)
  lib
    utils (date formatting, currency converter)