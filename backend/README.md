# e-SOP Sawit — Backend API

REST API untuk distribusi SOP perkebunan kelapa sawit. Node.js 20 + Express 4 + Prisma + PostgreSQL.

## Menjalankan
```bash
cp .env.example .env          # isi DATABASE_URL & JWT_SECRET
npm install
npx prisma migrate dev        # buat tabel
npx prisma db seed            # user admin + 6 kategori SOP sawit
npm run dev                   # http://localhost:3001/api/health
```

## Endpoint Utama
| Grup | Endpoint | Fungsi |
|------|----------|--------|
| Auth | `POST /auth/login`, `/auth/refresh` | JWT access (8 jam) + refresh (30 hari) |
| Users | `GET/POST/PUT /users` | Manajemen akun & role (Superadmin) |
| Categories | `GET /categories` | Kategori SOP (PN, PM, SP, IR, QM, K3) |
| SOPs | `GET/POST/PUT /sops`, `/sops/:id/publish` | CRUD + unggah PDF + versioning |
| **Sync** | `GET /sync/manifest?since=` | **Metadata SOP berubah sejak lastSync (untuk offline sync)** |
| **Sync** | `GET /sync/files/:id` | **Unduh PDF + header X-File-Checksum** |
| Sync | `POST /sync/logs` | Audit log hasil sync perangkat |

Spesifikasi lengkap: `docs/api-spec.md` di root monorepo.

## Struktur
```
backend/
├── prisma/
│   ├── schema.prisma      # model data: users, categories, sop_documents, sync_logs
│   └── seed.js            # data awal: admin + kategori sawit
└── src/
    ├── index.js           # Express app
    ├── config/env.js      # konfigurasi .env terpusat
    ├── middleware/        # auth JWT, role guard, multer upload, error handler
    ├── routes/            # auth, users, categories, sops, sync
    ├── controllers/       # logika bisnis (sync.controller = inti offline strategy)
    └── utils/paths.js     # path upload + SHA-256
```

## Docker (opsional)
```bash
docker compose up -d --build   # backend + PostgreSQL
```
