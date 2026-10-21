package com.sawit.esop

import android.app.Application
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.Constraints
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.sawit.esop.data.local.SopDatabase
import com.sawit.esop.data.remote.ApiService
import com.sawit.esop.data.remote.AuthInterceptor
import com.sawit.esop.data.remote.TokenStore
import com.sawit.esop.data.repository.AuthRepository
import com.sawit.esop.data.repository.SopRepository
import com.sawit.esop.sync.SyncWorker
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Kontainer dependensi manual (tanpa Hilt agar skeleton ringan).
 * Semua singleton aplikasi dibuat di sini dan diakses via (application as SopApplication).container
 */
class SopApplication : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        schedulePeriodicSync()
    }

    /**
     * Sinkronisasi otomatis tiap 6 jam ketika ada koneksi internet.
     * WorkManager tahan terhadap aplikasi ditutup & restart perangkat.
     */
    private fun schedulePeriodicSync() {
        val constraint = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val request = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)
            .setConstraints(constraint)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "sop_periodic_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }
}

class AppContainer(context: Application) {
    val database: SopDatabase = SopDatabase.getInstance(context)
    val tokenStore: TokenStore = TokenStore(context)

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .addInterceptor(AuthInterceptor(tokenStore))
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC // ganti BODY saat debugging
        })
        .build()

    val api: ApiService = Retrofit.Builder()
        .baseUrl(ApiService.BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    val authRepository: AuthRepository = AuthRepository(api, database, tokenStore)
    val sopRepository: SopRepository = SopRepository(api, database, context.filesDir)
}
