# Kebijakan Keamanan — e-SOP Sawit

## Melaporkan Kerentanan

Jika Anda menemukan celah keamanan (misalnya token JWT bocor, akses
tidak sah antar-role, atau tautan SOP dapat diakses tanpa login):

1. **JANGAN** buat Issue publik — itu mempercepat eksploitasi.
2. Laporkan langsung kepada admin sistem / SUPERADMIN melalui kanal
   internal perusahaan (email/WhatsApp kerja).
3. Sertakan: langkah reproduksi, tangkapan layar (sensor data sensitif),
   dan perkiraan dampak.

Tim akan menindaklanjuti sesuai kebijakan internal perusahaan.

## Garis Dasar Keamanan yang Sudah Diterapkan

| Aspek | Mekanisme |
|-------|-----------|
| Autentikasi | JWT + bcrypt (password tidak pernah disimpan polos) |
| Otorisasi | Middleware role-guard per endpoint (5 level role) |
| Transport | Wajib HTTPS di produksi (Let's Encrypt di VPS) |
| Token di Android | Disimpan di `EncryptedSharedPreferences` |
| File SOP | Disimpan di storage internal aplikasi (bukan SD card publik) |
| Upload | Validasi tipe & ukuran file di backend (multer) |

## Checklist Saat Deploy Produksi

- [ ] Ganti `JWT_SECRET` dengan nilai acak ≥ 32 karakter (`openssl rand -hex 32`)
- [ ] Ganti password akun `admin` default
- [ ] Aktifkan HTTPS untuk backend **dan** web admin
- [ ] Batas `CORS_ORIGIN` hanya ke domain web admin produksi
- [ ] Jadwalkan backup database harian (`scripts/backup-db.sh`)
- [ ] Repo GitHub diset **Private** + branch `main` diproteksi
- [ ] `network_security_config.xml` Android hanya mengizinkan cleartext untuk host debug

## Versi yang Didukung

Proyek ini bersifat internal — hanya versi terakhir di branch `main`
yang menerima perbaikan keamanan. Pastikan selalu menarik (`git pull`)
sebelum deploy.
