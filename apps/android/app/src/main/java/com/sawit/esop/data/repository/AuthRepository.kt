package com.sawit.esop.data.repository

import com.sawit.esop.data.local.SopDatabase
import com.sawit.esop.data.local.entity.CategoryEntity
import com.sawit.esop.data.local.entity.UserEntity
import com.sawit.esop.data.remote.TokenStore
import com.sawit.esop.data.remote.ApiService
import com.sawit.esop.data.remote.dto.LoginRequest

/**
 * Autentikasi: login ke server, simpan sesi user di Room + token di EncryptedSharedPreferences.
 * Setelah login sukses, data SOP bisa di-sync dan dibaca offline.
 */
class AuthRepository(
    private val api: ApiService,
    private val db: SopDatabase,
    private val tokenStore: TokenStore
) {

    suspend fun login(nik: String, password: String): Result<UserEntity> = runCatching {
        val response = api.login(LoginRequest(nik.trim(), password))
        val data = response.data ?: error("Respons login tidak valid dari server")

        tokenStore.save(data.accessToken, data.refreshToken)
        val user = UserEntity(
            id = data.user.id,
            nik = data.user.nik,
            name = data.user.name,
            role = data.user.role,
            division = data.user.division,
            estate = data.user.estate
        )
        db.userDao().save(user)
        user
    }

    suspend fun logout() {
        db.userDao().clear()
        db.sopDao().clearAll()
        db.categoryDao().clearAll()
        tokenStore.clear()
    }

    fun observeSession() = db.userDao().observe()
}
