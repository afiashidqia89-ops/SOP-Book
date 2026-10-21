# Panduan 100% Online — Bangun e-SOP Sawit Tanpa Install Apa Pun

> Panduan ini untuk Anda yang **tidak memiliki Android Studio, Node.js, atau git di PC**.
> Cukup **browser** (Chrome/Edge) + file ZIP monorepo. Semuanya gratis untuk skala pilot.

## Peta Besar — Apa Dikerjakan di Mana

| Komponen | Dikerjakan di | Peran | Biaya |
|----------|--------------|-------|-------|
| Kode program | **GitHub.com** (web + Codespaces) | Upload, edit, simpan kode | Gratis |
| Database PostgreSQL | **Neon.tech** | Simpan data SOP + **file PDF** | Gratis 0,5 GB |
| Backend API | **Render.com** | Server API untuk Android & web admin | Gratis |
| Web Admin | **Vercel.com** | Dashboard kelola SOP (upload/publish) | Gratis |
| APK Android | **GitHub Actions** | Build APK otomatis di server GitHub | Gratis |
| File PDF SOP | Disimpan di **database Neon** | Tidak hilang walau server restart | — |

```
PC Anda (hanya browser)
   │  upload kode sekali saja
   ▼
GitHub (kode + build APK)
   ├──► Render.com ──► Neon.tech (database + file PDF)
   └──► Vercel (web admin)
              ▲
   HP Android │ sync SOP / baca offline
```

**Estimasi waktu total: ±1 jam** (sebagian besar menunggu build otomatis).

---

## Langkah 0 — Buat Akun (±15 menit)

Buat 4 akun, semuanya gratis dan bisa login pakai akun GitHub:

1. **github.com** → Sign up → verifikasi email.
2. **neon.tech** → Sign up → pilih *Continue with GitHub*.
3. **render.com** → Get Started → *GitHub*.
4. **vercel.com** → Sign Up → *Continue with GitHub*.

> Gunakan satu email kerja yang sama untuk semua akun agar mudah dikelola.

---

## Langkah 1 — Upload Kode ke GitHub (±10 menit)

### Persiapan
Ekstrak `sop-sawit-monorepo.zip` di PC: klik kanan → **Extract All**. Akan muncul folder `sop-sawit` (isi ±100 file). PC hanya dipakai untuk ekstrak ZIP — tidak perlu install apa pun.

### 1.1 Buat repositori kosong
1. Buka **github.com/new**
2. Repository name: `sop-sawit`
3. Pilih **Private** (wajib — berisi SOP internal perusahaan)
4. **Jangan** centang README / .gitignore / license
5. Klik **Create repository**

### 1.2 Buka Codespaces (VS Code di browser)
1. Di halaman repo, klik tombol hijau **`< > Code`**
2. Tab **Codespaces** → **Create codespace on main**
3. Tunggu ±30 detik — VS Code terbuka di browser

### 1.3 Upload folder kode
1. Di panel kiri VS Code (Explorer), klik kanan area kosong → **Upload...**
2. Pilih folder **`sop-sawit`** (hasil ekstraksi tadi)
3. Konfirmasi replace jika ditanya → tunggu upload selesai (±100 file, termasuk folder `.github`)

> Alternatif lebih cepat: **drag & drop** folder `sop-sawit` dari File Explorer langsung ke panel Explorer VS Code.

### 1.4 Commit & push
1. Klik ikon **Source Control** di panel kiri (ikon cabang, angka menunjukkan banyak perubahan)
2. Ketik pesan: `feat: struktur awal monorepo e-SOP Sawit`
3. Klik **Commit** → jika ditanya *stage all changes* → **Yes**
4. Klik **Sync Changes** (atau tombol Push)

### 1.5 Verifikasi
Refresh halaman repo di github.com → semua folder tampil (`apps`, `backend`, `docs`, `.github`). Tab **Actions** mungkin langsung mulai berjalan — biarkan saja.

---

## Langkah 2 — Database Neon (±5 menit)

1. Login **neon.tech** → **Create project**
   - Project name: `esop-sawit`
   - Postgres version: 16
   - Region: **Singapore** (paling dekat dengan Indonesia)
2. Setelah jadi, dashboard menampilkan **Connection string**. Klik ikon salin.
   Formatnya kira-kira:
   ```
   postgresql://user:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
3. **Simpan string ini di notepad** — dipakai di Langkah 3.

> 💡 Kapasitas free: 0,5 GB. File PDF SOP disimpan langsung di database, jadi cukup untuk ±200 SOP PDF berukuran 2 MB.

---

## Langkah 3 — Deploy Backend ke Render (±10 menit)

Repo sudah berisi `render.yaml` (blueprint) — Render membacanya otomatis:

1. Login **render.com** → **New +** → **Blueprint**
2. Pilih repositori **sop-sawit** → **Connect**
3. Render mendeteksi layanan `esop-sawit-api` dan meminta 2 variabel:
   | Variabel | Isi dengan |
   |----------|-----------|
   | `DATABASE_URL` | Connection string Neon dari Langkah 2 |
   | `CORS_ORIGIN` | `https://belum-ada.vercel.app` (sementara — diganti di Langkah 4) |
4. Klik **Apply** → tunggu build ±3–5 menit (Render otomatis: install → siapkan tabel → seed data awal → jalankan API)
5. **Catat URL** di atas halaman service, misal:
   `https://esop-sawit-api-xxxx.onrender.com`
6. **Uji**: buka `https://esop-sawit-api-xxxx.onrender.com/api/health` di browser
   → harus muncul: `{"ok":true,"service":"e-SOP Sawit API",...}`

> ⚠️ **Karakteristik free tier Render**: server *tidur* setelah 15 menit tidak dipakai. Akses pertama setelah tidur lambat ±30–60 detik — itu **normal**, bukan error. Akses berikutnya cepat lagi. Data tidak hilang karena PDF tersimpan di database Neon, bukan di disk Render.
>
> 🔑 Akun awal otomatis dibuat: `admin/admin123` (SUPERADMIN) — **segera buat akun SUPERADMIN cadangan dengan password sendiri** lewat menu Kelola User setelah web admin aktif.

---

## Langkah 4 — Deploy Web Admin ke Vercel (±5 menit)

1. Login **vercel.com** → **Add New...** → **Project**
2. Import repositori **sop-sawit**
3. Sebelum klik Deploy, atur:
   - **Root Directory**: klik *Edit* → pilih `apps/web`
   - Framework Preset: Next.js (terdeteksi otomatis)
   - **Environment Variables** tambahkan:
     | Name | Value |
     |------|-------|
     | `NEXT_PUBLIC_API_URL` | `https://esop-sawit-api-xxxx.onrender.com/api` |
4. Klik **Deploy** → tunggu ±2–3 menit
5. **Catat URL**, misal: `https://sop-sawit-xxx.vercel.app`
6. **Kembali ke Render** → service `esop-sawit-api` → tab **Environment** → edit `CORS_ORIGIN` → isi URL Vercel tadi (tanpa garis miring akhir) → **Save** (backend otomatis redeploy ±1 menit)
7. **Uji**: buka URL Vercel → login `admin/admin123` → ganti password & buat akun SUPERADMIN cadangan

---

## Langkah 5 — Build APK Android di GitHub (±15 menit)

APK dibangun sepenuhnya oleh server GitHub — tanpa Android Studio.

### 5.1 Atur alamat server di dalam APK
1. Di github.com, buka file **`apps/android/gradle.properties`**
2. Klik **ikon pensil** (Edit in place)
3. Ubah baris `BASE_URL` menjadi URL backend Render Anda (harus diakhiri `/api/`):
   ```
   BASE_URL=https://esop-sawit-api-xxxx.onrender.com/api/
   ```
4. Klik **Commit changes**

### 5.2 Jalankan build
1. Tab **Actions** → pilih **Android CI** → **Run workflow** → **Run workflow**
2. Tunggu ±8–12 menit (muncul centang hijau ✅)
3. Klik run tersebut → scroll ke bawah → bagian **Artifacts** → unduh **e-sop-sawit-debug**
4. Ekstrak ZIP hasil unduhan → berisi `app-debug.apk`

### 5.3 (Disarankan) Rilis resmi dengan versi
1. Tab **Releases** → **Draft a new release**
2. *Choose a tag* → ketik `v1.0.0` → **Create new tag on publish**
3. Judul: `Rilis v1.0.0` → **Publish release**
4. Workflow **Android Release** otomatis membangun APK dan **melampirkannya ke Release** — buka Release tersebut, APK ada di bagian *Assets*

### 5.4 Pasang di HP
1. Admin mengunduh APK → kirim ke HP karyawan via **WhatsApp / Google Drive**
   (repo Private, jadi unduhan langsung dari GitHub hanya untuk orang berizin)
2. Di HP: buka file APK → izinkan *Instal dari sumber tidak dikenal* → Instal
3. Buka aplikasi → login dengan akun yang dibuat admin (NIK + password)
4. Di halaman utama **tarik ke bawah** → SOP terunduh → matikan sinyal, SOP tetap bisa dibaca (offline)

---

## Langkah 6 — Operasional Harian

| Kegiatan | Cara |
|----------|------|
| **Upload SOP baru** | Web admin → Kelola SOP → Tambah → isi kode/judul/kategori → pilih PDF → Simpan → tombol **Publish** |
| **Revisi SOP** | Kelola SOP → pilih SOP → unggah PDF baru → status kembali DRAFT → **Publish** → versi naik otomatis |
| **Tarik SOP (arsip)** | Kelola SOP → **Arsipkan** → otomatis terhapus dari semua HP saat sync berikutnya |
| **Tambah karyawan** | Kelola User → Tambah → NIK, nama, role, password awal |
| **Sync di HP** | Otomatis tiap 6 jam + manual (tarik ke bawah). SOP yang sudah terunduh tetap terbaca tanpa sinyal |
| **Audit distribusi** | Server mencatat perangkat apa saja yang mengunduh tiap SOP (tabel sync_logs) |

**Alur data**: Admin upload PDF → disimpan di database Neon → Publish → HP karyawan sync (manifest diferensial + checksum SHA-256) → PDF tersimpan di storage internal HP → dibaca offline.

---

## Troubleshooting

| Gejala | Penyebab & Solusi |
|--------|-------------------|
| `/api/health` lambat/timeout saat pertama dibuka | Free tier Render sedang "bangun dari tidur". Tunggu 30–60 detik, refresh. |
| Login web admin: *Network Error* | `NEXT_PUBLIC_API_URL` di Vercel salah, atau `CORS_ORIGIN` di Render belum diganti ke URL Vercel. Cek kedua env var, lalu redeploy. |
| APK: "tidak bisa terhubung ke server" | `BASE_URL` di `gradle.properties` salah — harus persis URL Render **diakhiri `/api/`**. Perbaiki → Commit → Run workflow lagi → instal ulang APK. |
| APK tidak muncul di Release | Buka tab Actions → pilih run *Android Release* → baca log error. Penyebab umum: tag bukan format `v1.0.0`. |
| Upload PDF gagal | Ukuran > 25 MB (`MAX_FILE_SIZE`). Kompres PDF atau pecah menjadi beberapa SOP. |
| Upload PDF gagal (browser) | Pastikan backend Render sudah *bangun* (buka `/api/health` dulu), lalu coba lagi. |
| Lupa password admin | Gunakan akun SUPERADMIN cadangan (wajib dibuat di Langkah 4 poin 7). Tanpa itu, hubungi yang memegang akses database Neon. |
| Database Neon penuh | Free 0,5 GB ≈ 200 SOP @2 MB. Arsipkan SOP lama, atau upgrade paket Neon. |
| Build Android CI gagal merah | Buka log run yang gagal → lihat step berwarna merah → biasanya kesalahan ketik saat mengedit file lewat web. Perbaiki dan Commit ulang. |

---

## Biaya & Batas (Free Tier)

| Layanan | Batas Gratis | Kapan Perlu Upgrade |
|---------|--------------|---------------------|
| GitHub Free | Actions 2.000 menit/bulan (±150 build APK) | >150 rilis/bulan |
| Neon Free | 0,5 GB database (±200 SOP @2 MB) | Arsip SOP besar |
| Render Free | 750 jam/bulan, tidur 15 menit, cold start | Server harus selalu responsif |
| Vercel Hobby | Cukup untuk dashboard internal | Traffic sangat tinggi |

**Total untuk pilot: Rp0.** Untuk produksi penuh (ratusan pengguna, SOP banyak), pertimbangkan Render Starter ($7/bln — server tidak tidur) + Neon Launch ($19/bln).

---

## Keamanan yang Tetap Wajib

- ✅ Segera ganti password `admin/admin123` default
- ✅ Buat **akun SUPERADMIN cadangan** (kalau password utama lupa)
- ✅ `JWT_SECRET` otomatis acak oleh Render blueprint — jangan diganti sembarangan
- ✅ HTTPS aktif otomatis di Render & Vercel — jangan pakai link `http://` manual
- ✅ Repo GitHub tetap **Private**
- ✅ Unduh APK hanya dari sumber resmi (Release GitHub / admin) — jangan disebar di luar perusahaan
