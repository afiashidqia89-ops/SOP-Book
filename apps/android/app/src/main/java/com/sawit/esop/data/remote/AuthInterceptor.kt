package com.sawit.esop.data.remote

import okhttp3.Interceptor
import okhttp3.Response

/**
 * Melampirkan header Authorization: Bearer <token> ke setiap request.
 * Juga mengirim X-Device-Id untuk audit log sinkronisasi di server.
 */
class AuthInterceptor(private val tokenStore: TokenStore) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val builder = chain.request().newBuilder()
            .header("X-Device-Id", DeviceInfo.deviceId)

        tokenStore.accessToken()?.let { builder.header("Authorization", "Bearer $it") }

        return chain.proceed(builder.build())
    }
}

/** ID perangkat sederhana — cukup unik untuk audit log, tidak sensitif. */
object DeviceInfo {
    // TODO: ganti dengan Settings.Secure.ANDROID_ID yang diambil dari context
    const val deviceId: String = "android-device-001"
}
