package com.sawit.esop.data.remote

import com.sawit.esop.BuildConfig
import com.sawit.esop.data.remote.dto.CategoryDto
import com.sawit.esop.data.remote.dto.GenericResponse
import com.sawit.esop.data.remote.dto.LoginRequest
import com.sawit.esop.data.remote.dto.LoginResponse
import com.sawit.esop.data.remote.dto.ManifestResponse
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Definisi endpoint Backend API.
 *
 * BASE_URL diambil otomatis dari `gradle.properties` (properti BASE_URL)
 * saat APK dibangun — sehingga bisa diubah lewat editor web GitHub
 * tanpa Android Studio (lihat docs/panduan-100-online.md):
 *   1. Buka apps/android/gradle.properties di github.com (ikon pensil)
 *   2. Ganti baris:  BASE_URL=https://esop-sawit-api.onrender.com/api/
 *   3. Commit → tab Actions membangun APK baru → unduh dari Releases
 */
interface ApiService {

    companion object {
        const val BASE_URL: String = BuildConfig.API_BASE_URL
    }

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    /** Manifest — hanya metadata SOP yang berubah sejak `since` (hemat kuota di kebun). */
    @GET("sync/manifest")
    suspend fun getManifest(@Query("since") since: String?): ManifestResponse

    /** Daftar kategori — di-cache ke Room agar menu kategori tetap tampil offline. */
    @GET("categories")
    suspend fun getCategories(): GenericResponse<List<CategoryDto>>

    /** Unduh file PDF. Header respons berisi X-File-Checksum & X-Sop-Version untuk verifikasi. */
    @GET("sync/files/{sopId}")
    suspend fun downloadFile(
        @Path("sopId") sopId: Int,
        @Header("X-Device-Id") deviceId: String
    ): ResponseBody

    /** Lapor hasil sync ke server (audit distribusi). */
    @POST("sync/logs")
    suspend fun reportSyncLog(@Body body: Map<String, Any>): GenericResponse<Int>
}
