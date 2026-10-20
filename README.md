# Company SOP Platform Cloud-Only

Platform SOP dan Instruksi Kerja berbasis Flutter, Next.js, NestJS, PostgreSQL, Redis, dan MinIO. Tidak ada modul kuis.

## Penggunaan melalui browser

1. Upload seluruh isi project ke repository GitHub private.
2. Buka **Code > Codespaces > Create codespace on main**.
3. Tunggu `postCreateCommand` selesai.
4. Jalankan:

```bash
bash scripts/cloud-up.sh
```

5. Buka terminal kedua:

```bash
bash scripts/run-api.sh
```

6. Buka terminal ketiga:

```bash
bash scripts/run-web.sh
```

7. Buka panel **Ports**:
   - Port 3000: web administrator.
   - Port 3001: API; tambahkan `/docs` untuk Swagger.
   - Port 9001: MinIO Console.

## Akun pengembangan

- Email: `admin@example.com`
- Password: `ChangeMe123!`

Ganti sebelum penggunaan nyata.

## Build APK

Buka tab **Actions**, pilih **Mobile CI**, klik **Run workflow**. Setelah selesai, unduh artifact `sop-mobile-debug`.

## Menghentikan layanan

```bash
bash scripts/cloud-down.sh
```

Hentikan Codespace dari halaman GitHub ketika selesai agar kuota compute tidak terus digunakan.
