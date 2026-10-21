package com.sawit.esop.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sawit.esop.SopApplication
import com.sawit.esop.data.repository.SopRepository
import java.io.IOException

/**
 * SyncWorker — tugas latar belakang WorkManager.
 *
 * Dipicu:
 *  1. Periodik 6 jam (dijadwalkan di SopApplication) saat ada koneksi internet.
 *  2. Manual — pull-to-refresh di HomeScreen / tombol Sync di ProfileScreen.
 *
 * Jika jaringan gagal → Result.retry() dengan backoff eksponensial.
 * Selama sync gagal, UI tetap menampilkan SOP terakhir dari Room (offline).
 */
class SyncWorker(appContext: Context, params: WorkerParameters) :
    CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val container = (applicationContext as SopApplication).container
        val repository: SopRepository = container.sopRepository

        return try {
            val downloaded = repository.syncFromServer()
            android.util.Log.i(TAG, "Sinkronisasi selesai — $downloaded SOP diunduh/diperbarui")
            Result.success()
        } catch (e: IOException) {
            android.util.Log.w(TAG, "Jaringan tidak tersedia — sync dijadwalkan ulang", e)
            Result.retry()
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Sync gagal: ${e.message}", e)
            Result.failure()
        }
    }

    private companion object {
        const val TAG = "SyncWorker"
    }
}
