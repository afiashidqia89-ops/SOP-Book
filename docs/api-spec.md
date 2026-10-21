# e-SOP Sawit — Spesifikasi API

Base URL: `http(s)://<host>:3001/api`
Autentikasi: header `Authorization: Bearer <access_token>` (JWT, kedaluwarsa 8 jam).

## 1. Autentikasi

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/login` | publik | Login dengan `nik` + `password` → `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | publik | Tukar `refreshToken` dengan token baru |
| GET | `/auth/profile` | semua | Profil user yang sedang login |

**Contoh request login:**
```json
POST /api/auth/login
{ "nik": "admin", "password": "admin123" }
```

## 2. Manajemen User (Web Admin)

| Method | Endpoint | Role minimal | Deskripsi |
|--------|----------|--------------|-----------|
| GET | `/users` | ASSISTANT | Daftar user (filter `?role=&estate=&division=`) |
| POST | `/users` | SUPERADMIN | Buat user baru |
| PUT | `/users/:id` | SUPERADMIN | Ubah data/role user |
| PATCH | `/users/:id/status` | SUPERADMIN | Aktifkan/nonaktifkan user |

## 3. Kategori SOP

| Method | Endpoint | Role minimal | Deskripsi |
|--------|----------|--------------|-----------|
| GET | `/categories` | publik (login) | Daftar kategori (PN, PM, SP, IR, QM, K3, ...) |
| POST | `/categories` | SUPERADMIN | Tambah kategori |

## 4. Dokumen SOP

| Method | Endpoint | Role minimal | Deskripsi |
|--------|----------|--------------|-----------|
| GET | `/sops` | semua | Daftar SOP. Filter: `?status=PUBLISHED&categoryId=&q=` |
| GET | `/sops/:id` | semua | Detail satu SOP |
| POST | `/sops` | ASSISTANT | Unggah SOP baru — `multipart/form-data`: `title`, `code`, `categoryId`, `description`, `file` (PDF ≤ 25 MB) |
| PUT | `/sops/:id` | ASSISTANT | Revisi SOP (opsional ganti file) → `version++`, checksum baru |
| POST | `/sops/:id/publish` | MANAGER | Publikasikan SOP agar terunduh ke perangkat |
| PATCH | `/sops/:id/archive` | MANAGER | Arsipkan SOP (tidak lagi ter-distribusi) |

## 5. Sinkronisasi (dipakai aplikasi Android)

### `GET /sync/manifest?since=<ISO8601>`

Mengembalikan metadata **seluruh SOP PUBLISHED yang berubah sejak `since`** (atau semua jika `since` kosong). Klien membandingkan dengan Room DB:

```json
{
  "serverTime": "2026-01-20T02:15:00.000Z",
  "items": [
    {
      "id": 12,
      "code": "SOP-PN-001",
      "title": "SOP Panen Cut & Keep",
      "categoryId": 1,
      "version": 3,
      "checksum": "9f2c1a...e7",
      "fileName": "sop-panen-cut-keep-v3.pdf",
      "fileSize": 842113,
      "updatedAt": "2026-01-18T07:00:00.000Z",
      "deleted": false
    }
  ]
}
```

- `deleted: true` → klien wajib menghapus SOP tersebut dari Room & storage (ditarik dari peredaran).
- Jika `checksum` lokal ≠ server → unduh ulang file.
- Jika sama → tidak ada transfer (hemat kuota).

### `GET /sync/files/:id`

Mengunduh file PDF terbaru dari SOP `:id`. Server **mencatat** `sync_logs` (user, device, sop, waktu) untuk audit distribusi.

### `POST /sync/logs`

Melaporkan hasil sync dari perangkat: `{ deviceId, syncedItems: [sopId...], action: "SYNC_OK" }`.

## 6. Kode Status

| Kode | Arti |
|------|------|
| 200 / 201 | Sukses |
| 400 | Payload tidak valid |
| 401 | Token hilang / kedaluwarsa |
| 403 | Role tidak berhak |
| 404 | Data tidak ditemukan |
| 409 | Duplikat (mis. kode SOP sudah ada) |
| 413 | File melebihi 25 MB |
| 500 | Kesalahan server |
