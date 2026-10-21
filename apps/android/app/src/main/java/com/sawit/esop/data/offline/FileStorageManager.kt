package com.sawit.esop.data.offline

import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest

/**
 * Mengelola penyimpanan file PDF SOP di storage INTERNAL perangkat.
 * Struktur: filesDir/sop/<sopId>/v<version>-<fileName>.pdf
 *
 * File internal tidak bisa diakses aplikasi lain → SOP perusahaan tetap terlindungi.
 */
class FileStorageManager(private val filesDir: File) {

    private fun sopDir(sopId: Int): File = File(filesDir, "sop/$sopId").apply { mkdirs() }

    fun targetFile(sopId: Int, version: Int, fileName: String?): File =
        File(sopDir(sopId), "v$version-${fileName ?: "sop-$sopId.pdf"}")

    /** Hapus semua file versi lama setelah versi baru tersimpan. */
    fun deleteOldVersions(sopId: Int, keepFile: File) {
        sopDir(sopId).listFiles()?.forEach { if (it != keepFile) it.delete() }
    }

    fun deleteAll(sopId: Int) {
        sopDir(sopId).deleteRecursively()
    }

    /** Verifikasi checksum SHA-256 file lokal vs nilai dari server. */
    fun verifyChecksum(file: File, expectedSha256: String?): Boolean {
        if (expectedSha256.isNullOrBlank()) return true // server belum mengirim checksum
        return sha256(file).equals(expectedSha256, ignoreCase = true)
    }

    /** Simpan stream respons (dari Retrofit/OkHttp) ke file sekaligus hitung SHA-256. */
    fun saveStreamToFile(source: okio.BufferedSource, target: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        FileOutputStream(target).use { out ->
            val buffer = ByteArray(8192)
            var read: Int
            while (source.read(buffer).also { read = it } != -1) {
                out.write(buffer, 0, read)
                digest.update(buffer, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    private fun sha256(file: File): String =
        MessageDigest.getInstance("SHA-256").let { md ->
            file.inputStream().use { input ->
                val buffer = ByteArray(8192)
                var read: Int
                while (input.read(buffer).also { read = it } != -1) md.update(buffer, 0, read)
            }
            md.digest().joinToString("") { "%02x".format(it) }
        }
}
