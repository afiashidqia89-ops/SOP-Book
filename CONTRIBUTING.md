# Panduan Kontribusi — e-SOP Sawit

Terima kasih ingin berkontribusi! Dokumen ini menjelaskan alur kerja
yang berlaku di repositori ini agar riwayat git tetap rapi dan setiap
perubahan dapat ditinjau sebelum masuk ke `main`.

## 1. Alur Branch (Git Flow Sederhana)

```
main      ── kode produksi (DIPROTEKSI — hanya lewat Pull Request)
  └── dev ── integrasi harian
       └── feature/<nama-fitur>   ── contoh: feature/sync-fcm
       └── fix/<nama-bug>         ── contoh: fix/login-timeout
```

Aturan singkat:
- **Jangan pernah commit langsung ke `main`.**
- Satu branch = satu fitur/perbaikan. Jangan campur banyak hal.
- Branch diambil dari `dev`, hasilkan Pull Request ke `dev`.
- `dev` → `main` hanya saat siap rilis (tag versi).

## 2. Mulai Bekerja

```bash
git clone https://github.com/<username>/sop-sawit.git
cd sop-sawit
git checkout dev && git pull origin dev
git checkout -b feature/nama-fitur
```

## 3. Sebelum Commit

Pastikan lolos minimal di area yang Anda sentuh:

| Area | Perintah cek |
|------|--------------|
| `backend/` | `node --check src/index.js` + `npx prisma validate` |
| `apps/web/` | `npm run build` |
| `apps/android/` | `gradle assembleDebug` (atau build dari Android Studio) |

CI GitHub Actions akan menjalankan pemeriksaan yang sama secara otomatis
pada setiap push dan Pull Request — PR tidak bisa di-merge bila CI merah.

## 4. Pesan Commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/id/):

```
<jenis>: <deskripsi singkat dalam bahasa Indonesia>

feat: tambah modul checklist panen di aplikasi android
fix: perbaiki checksum SOP yang gagal diverifikasi saat sync
docs: perbarui spesifikasi endpoint sync manifest
refactor: pisahkan logika versi SOP ke service terpisah
chore: naikkan versi prisma ke 5.22
```

Jenis yang dipakai: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`.

## 5. Pull Request

1. Push branch: `git push -u origin feature/nama-fitur`
2. Buka PR ke branch `dev` (gunakan template yang muncul otomatis).
3. Isi checklist pada template PR.
4. Minta review minimal 1 orang (aturan CODEOWNERS akan menandai
   reviewer otomatis per area).
5. Merge hanya setelah CI hijau + disetujui reviewer.

## 6. Gaya Kode

- **Backend (Node.js)**: ES Module (`import`/`export`), 2 spasi, tanpa
  semicolon di akhir baris adalah ok selama konsisten dengan file sekitar.
- **Web (Next.js)**: TypeScript, komponen fungsional + hooks, 2 spasi.
- **Android (Kotlin)**: ikuti
  [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html).
- `.editorconfig` sudah tersedia — aktifkan plugin EditorConfig di editor
  Anda agar indentasi otomatis konsisten.

## 7. Melaporkan Bug / Mengusulkan Fitur

Gunakan template Issue yang tersedia (tab **Issues** → **New issue**):
- 🐛 **Bug Report** — untuk kejanggalan/error.
- ✨ **Feature Request** — untuk usulan fitur baru.

Untuk celah keamanan (token bocor, akses tidak sah), JANGAN buat Issue
publik — ikuti [SECURITY.md](SECURITY.md).
