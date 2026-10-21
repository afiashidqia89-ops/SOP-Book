# e-SOP Sawit — Dokumen Arsitektur

> Ringkasan arsitektur dalam Markdown (untuk repo). Dokumen PDF lengkap tersedia terpisah: `Dokumen-Arsitektur-e-SOP-Sawit.pdf`.

## 1. Gambaran Umum

e-SOP Sawit adalah sistem distribusi dokumen SOP (Standard Operating Procedure) dan Instruksi Kerja untuk perusahaan perkebunan kelapa sawit. Sistem menggantikan SOP cetak dengan media digital yang selalu mutakhir, dan tetap berfungsi penuh di area kebun tanpa sinyal internet.

Tiga komponen utama:

1. **Backend API** (`backend/`) — sumber kebenaran data. Node.js + Express + Prisma + PostgreSQL. Menyimpan metadata SOP, file PDF, user & role, serta log sinkronisasi.
2. **Web Admin** (`apps/web/`) — Next.js 14. Dipakai SUPERADMIN / MANAGER / ASSISTANT untuk mengelola kategori, dokumen SOP (unggah PDF), user, dan memantau log unduhan.
3. **Aplikasi Android** (`apps/android/`) — Kotlin Native + Jetpack Compose. Offline-first: semua SOP yang pernah diunduh tersimpan di Room DB + storage internal, sehingga bisa dibaca tanpa internet.

## 2. Strategi Offline-First (Inti Sistem)

```
┌──────────── WEB ADMIN ────────────┐
│ Unggah/Revisi SOP (PDF)           │
└──────────────┬────────────────────┘
               ▼
        BACKEND API  ── version++, checksum SHA-256, simpan file
               ▲
               │ ① GET /api/sync/manifest?since=...   (meta saja, hemat kuota)
               │ ② GET /api/sync/files/:id            (unduh jika berubah)
┌──────────────┴────────────────────┐
│ ANDROID SyncWorker (WorkManager)  │
│  - periodik 6 jam + pull-refresh  │
│  - bandingkan versi & checksum    │
│  - simpan: Room DB + filesDir/    │
└──────────────┬────────────────────┘
               ▼
        UI (Jetpack Compose) ── SELALU membaca Room (bukan API langsung)
```

Prinsip kunci:
- **Room DB adalah Single Source of Truth** di perangkat. UI tidak pernah memanggil API langsung untuk data SOP; semua lewat Repository.
- **Sync diferensial** — endpoint manifest hanya mengirim metadata (id, version, checksum, updatedAt) yang berubah sejak `lastSyncAt`, sehingga hemat bandwidth di area sinyal lemah.
- **Verifikasi integritas** — file PDF di perangkat diverifikasi checksum SHA-256; jika rusak, diunduh ulang.
- **WorkManager** — tugas sync tahan terhadap aplikasi dimatikan, restart perangkat, dan mode Doze; dapat dikonfigurasi hanya saat Wi-Fi.

## 3. Model Data (Ringkas)

| Tabel | Fungsi | Kolom Penting |
|-------|--------|---------------|
| `users` | Akun karyawan & role | nik, name, role (enum 5 level), division, estate |
| `categories` | Kategori/divisi SOP | code (PN/PM/SP/IR/QM/K3), name |
| `sop_documents` | Dokumen SOP + file PDF | code, title, version, status (DRAFT/PUBLISHED/ARCHIVED), file_url, checksum |
| `sync_logs` | Jejak unduhan perangkat | user_id, sop_id, device_id, action, synced_at |

Detail lengkap: lihat `backend/prisma/schema.prisma` dan spesifikasi API di `docs/api-spec.md`.

## 4. Struktur Layer Android

```
apps/android/app/src/main/java/com/sawit/esop/
├── data/
│   ├── local/      # Room: entity, dao, SopDatabase (offline source of truth)
│   ├── remote/     # Retrofit: ApiService, AuthInterceptor, DTO
│   ├── repository/ # AuthRepository, SopRepository (NetworkBoundResource)
│   ├── offline/    # FileStorageManager (simpan PDF di filesDir/sop/)
├── sync/           # SyncWorker (WorkManager) — orkestrasi sync diferensial
└── ui/             # Jetpack Compose: navigation, screens (login/home/detail/profile)
```

## 5. Keamanan

- **JWT** access token (masa aktif 8 jam) + refresh token (30 hari).
- Password di-hash dengan **bcrypt** (10 rounds).
- Role-based access control di middleware backend (`requireRole(...)`).
- Upload dibatasi tipe `application/pdf`, ukuran maksimum 25 MB.
- Token Android disimpan di **EncryptedSharedPreferences**; file SOP hanya bisa dibuka dari aplikasi (internal storage, permission `private`).

## 6. Roadmap Pengembangan

| Fase | Ruang Lingkup | Estimasi |
|------|---------------|----------|
| Fase 1 | Monorepo + backend + web admin + Android baca SOP offline | 4–6 minggu |
| Fase 2 | Notifikasi update SOP (FCM), statistik pembacaan per divisi | 4 minggu |
| Fase 3 | Checklist kepatuhan SOP + quiz pemahaman | 6 minggu |
| Fase 4 | Modul gambar/foto langkah kerja & video instruksi (unduhan offline) | 6 minggu |
