# e-SOP Sawit — Aplikasi Android (Kotlin Native)

Aplikasi offline-first untuk membaca SOP/Instruksi Kerja perkebunan kelapa sawit di lapangan.

## Teknologi
| Komponen | Pilihan |
|----------|---------|
| Bahasa | Kotlin 2.0 |
| UI | Jetpack Compose (Material 3) |
| Database offline | Room (SQLite) — single source of truth |
| Jaringan | Retrofit + OkHttp |
| Sinkronisasi | WorkManager (periodik 6 jam + manual) |
| Token | EncryptedSharedPreferences (AES-256) |
| Pembaca PDF | android-pdf-viewer (baca offline) |

## Struktur Kode
```
app/src/main/java/com/sawit/esop/
├── SopApplication.kt        # DI manual + penjadwalan WorkManager
├── MainActivity.kt          # Navigasi Compose
├── data/
│   ├── local/               # ROOM (offline): entity, dao, database
│   ├── remote/              # RETROFIT: ApiService, DTO, token terenkripsi
│   ├── repository/          # AuthRepository + SopRepository (logika sync)
│   └── offline/             # FileStorageManager (PDF di filesDir/sop/)
├── sync/SyncWorker.kt       # Worker sinkronisasi diferensial
├── ui/
│   ├── theme/               # Palet sawit
│   ├── navigation/          # Rute layar
│   └── screens/             # login, home (daftar+kategori), detail (PDF), profil
└── util/                    # ViewModel factory
```

## Menjalankan

1. Buka folder ini di **Android Studio** (Koala/2024.1+, JDK 17).
2. Biarkan Gradle sinkron (dependensi diunduh otomatis).
3. **Atur alamat server** di `data/remote/ApiService.kt`:
   ```kotlin
   const val BASE_URL = "http://10.0.2.2:3001/api/"   // emulator
   // http://192.168.x.x:3001/api/                     // HP fisik di LAN
   // https://api.perusahaan.com/api/                  // produksi
   ```
4. Jalankan `Run ▶` — login dengan akun hasil seed backend (`admin/admin123`).
5. Tekan tombol 🔄 di beranda → SOP terpublikasi terunduh → matikan internet dan buka kembali: SOP tetap terbaca.

> **Catatan wrapper:** skeleton ini belum menyertakan `gradlew` (binary). Setelah Gradle tersedia (via Android Studio / `brew install gradle`), jalankan `gradle wrapper --gradle-version 8.7` sekali untuk membuatnya — CI GitHub Actions tetap berjalan karena memakai action `gradle/actions/setup-gradle`.

## Alur Data (Offline-First)

```
UI (Compose) ──membaca──> Room DB ──<── SopRepository ──<── Retrofit API
                                │              │
                                │              ├─ manifest (meta) → bandingkan versi/checksum
                                │              ├─ unduh PDF bila berubah → filesDir/sop/
                                │              └─ verifikasi SHA-256
                          storage internal
```

- UI **tidak pernah** memanggil API langsung untuk menampilkan daftar — selalu dari Room.
- WorkManager menyinkronkan tiap 6 jam (tahan Doze, restart, aplikasi ditutup).
- SOP diarsipkan di server (`deleted=true` di manifest) otomatis dihapus dari perangkat.
