package com.sawit.esop.data.repository

import android.content.Context
import com.sawit.esop.data.local.SopDatabase
import com.sawit.esop.data.local.entity.CategoryEntity
import com.sawit.esop.data.local.entity.SopEntity
import com.sawit.esop.data.offline.FileStorageManager
import com.sawit.esop.data.remote.ApiService
import com.sawit.esop.data.remote.DeviceInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * REPOSITORI SOP — implementasi strategi OFFLINE-FIRST:
 *
 *  1. UI membaca data HANYA dari Room DB (observeAll / observeById).
 *  2. syncFromServer() menjalankan sinkronisasi diferensial:
 *     a. Ambil manifest (metadata saja) sejak lastSyncAt  → hemat kuota.
 *     b. Item deleted=true    → hapus dari Room + file lokal.
 *     c. Versi/checksum beda  → unduh PDF, verifikasi SHA-256, simpan + upsert Room.
 *     d. Simpan lastSyncAt = serverTime untuk siklus berikutnya.
 *  3. Bila tidak ada koneksi, sync dilewati dan UI tetap menampilkan data Room.
 */
class SopRepository(
    private val api: ApiService,
    private val db: SopDatabase,
    contextFilesDir: File
) {
    private val fileManager = FileStorageManager(contextFilesDir)
    private val prefs = contextFilesDir.getSharedPreferences("esop_sync", Context.MODE_PRIVATE)

    /** Observasi data untuk UI — 100% dari database lokal. */
    fun observeSops() = db.sopDao().observeAll()
    fun observeSop(id: Int) = db.sopDao().observeById(id)
    fun observeCategories() = db.categoryDao().observeAll()

    fun lastSyncAt(): Long = prefs.getLong(KEY_LAST_SYNC, 0L)

    /**
     * Sinkronisasi diferensial dengan server.
     * @return jumlah SOP yang diunduh/diperbarui.
     * Melempar IOException bila tidak ada koneksi — caller (SyncWorker) akan retry otomatis.
     */
    suspend fun syncFromServer(): Int = withContext(Dispatchers.IO) {
        val sinceIso = lastSyncAt().takeIf { it > 0 }?.let { formatIso(Date(it)) }

        // (a) Manifest — metadata saja, transfer kecil
        val manifest = api.getManifest(sinceIso).data ?: error("Manifest tidak valid")
        val items = manifest.items

        // (b) Hapus SOP yang diarsipkan/ditarik dari peredaran
        val deletedIds = items.filter { it.deleted }.map { it.id }
        if (deletedIds.isNotEmpty()) {
            deletedIds.forEach { fileManager.deleteAll(it) }
            db.sopDao().deleteByIds(deletedIds)
        }

        // (c) Unduh SOP baru/berubah (belum ada lokal, atau versi berubah)
        var downloaded = 0
        val nowIso = formatIso(Date())
        for (item in items.filter { !it.deleted }) {
            val local = db.sopDao().getById(item.id)
            val needsDownload = local == null || local.checksum != item.checksum

            var localPath: String? = local?.localPath
            if (needsDownload && item.fileName != null) {
                val target = fileManager.targetFile(item.id, item.version, item.fileName)
                val body = api.downloadFile(item.id, DeviceInfo.deviceId)
                body.source().use { source ->
                    val actualChecksum = fileManager.saveStreamToFile(source, target)
                    require(fileManager.verifyChecksum(target, item.checksum)) {
                        "Checksum tidak cocok untuk SOP ${item.code} — file rusak saat transfer"
                    }
                    if (actualChecksum != item.checksum && item.checksum.isNullOrBlank()) {
                        // server tidak mengirim checksum: gunakan hasil hitung lokal
                    }
                }
                fileManager.deleteOldVersions(item.id, target)
                localPath = target.absolutePath
                downloaded++
            }

            db.sopDao().upsertAll(
                listOf(
                    SopEntity(
                        id = item.id,
                        code = item.code,
                        title = item.title,
                        description = item.description,
                        categoryId = item.categoryId,
                        version = item.version,
                        fileName = item.fileName,
                        fileSize = item.fileSize,
                        checksum = item.checksum,
                        localPath = localPath,
                        updatedAt = item.updatedAt,
                        lastSyncedAt = nowIso
                    )
                )
            )
        }

        // (c.2) Cache kategori agar menu tetap ada saat offline
        val categories = api.getCategories().data.orEmpty()
        db.categoryDao().upsertAll(categories.map { CategoryEntity(it.id, it.code, it.name) })

        // (d) Simpan waktu sync terakhir
        prefs.edit().putLong(KEY_LAST_SYNC, System.currentTimeMillis()).apply()

        // Lapor hasil ke server (audit)
        runCatching {
            api.reportSyncLog(
                mapOf(
                    "deviceId" to DeviceInfo.deviceId,
                    "action" to "SYNC_OK",
                    "syncedItems" to items.filter { !it.deleted }.map { it.id }
                )
            )
        }

        downloaded
    }

    private fun formatIso(date: Date): String {
        val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        fmt.timeZone = TimeZone.getTimeZone("UTC")
        return fmt.format(date)
    }

    private companion object {
        const val KEY_LAST_SYNC = "last_sync_at"
    }
}
