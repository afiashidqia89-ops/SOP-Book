# Company SOP Platform

Monorepo awal untuk sistem SOP dan Instruksi Kerja perusahaan:

- `apps/mobile`: Flutter, offline-first, SQLite, download dokumen, acknowledgement, QR.
- `apps/web`: Next.js admin portal.
- `apps/api`: NestJS + Prisma + PostgreSQL API.
- `docker-compose.yml`: PostgreSQL, Redis, MinIO, API, dan Web.

Segmen kuis tidak disertakan.

## Menjalankan infrastruktur

```bash
cp .env.example .env
docker compose up -d postgres redis minio
```

## API

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

API: `http://localhost:3001/api/v1`  
Swagger: `http://localhost:3001/docs`

## Web

```bash
cd apps/web
npm install
npm run dev
```

Web: `http://localhost:3000`

## Mobile

Pastikan Flutter stable dan Android SDK telah terpasang.

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api/v1
```

Untuk membuat APK:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.domain-anda.com/api/v1
```

## Akun pengembangan

Setelah migrasi, jalankan seed:

```bash
cd apps/api
npm run prisma:seed
```

- Email: `admin@example.com`
- Password: `ChangeMe123!`

Ganti kredensial sebelum digunakan di luar lingkungan lokal.

## Catatan MVP

Starter ini menyediakan fondasi dan endpoint dasar. Sebelum produksi, tambahkan signing APK, TLS, rotasi secret, antivirus scanning upload, backup database, rate limiting, object-level authorization, integration test, dan observability.
