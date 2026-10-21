# e-SOP Sawit — Web Admin

Dashboard Next.js 14 (App Router) untuk mengelola SOP perkebunan sawit.

## Fitur
- **Login** — autentikasi NIK + password via backend (JWT)
- **Dashboard** — statistik SOP & user aktif
- **Kelola SOP** — unggah PDF (multipart), publikasi (version++), arsip
- **Kelola User** — buat akun & atur role (Superadmin saja), aktif/nonaktif

## Role yang bisa akses web admin
- SUPERADMIN (semua menu)
- MANAGER / AED (dashboard + SOP)
- ASSISTANT (dashboard + SOP)

## Menjalankan
```bash
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

## Struktur
```
src/
├── app/
│   ├── login/page.tsx        # halaman login
│   ├── dashboard/
│   │   ├── layout.tsx        # sidebar + guard role
│   │   ├── page.tsx          # ringkasan statistik
│   ├── sop/page.tsx          # CRUD + upload PDF SOP
│   └── users/page.tsx        # manajemen user
├── components/               # (placeholder untuk komponen bersama)
└── lib/
    ├── api.ts                # axios client + tipe data
    └── auth.tsx              # AuthProvider + hook useAuth
```

> Login default setelah seed backend: `admin` / `admin123`
