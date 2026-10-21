package com.sawit.esop.data.remote.dto

// ==== DTO (Data Transfer Object) — bentuk JSON dari Backend API ====

data class LoginRequest(val nik: String, val password: String)

data class LoginResponse(
    val success: Boolean,
    val data: LoginData?
) {
    data class LoginData(
        val accessToken: String,
        val refreshToken: String,
        val user: UserDto
    )

    data class UserDto(
        val id: Int,
        val nik: String,
        val name: String,
        val role: String,
        val division: String?,
        val estate: String?
    )
}

data class GenericResponse<T>(val success: Boolean, val data: T?)

data class CategoryDto(val id: Int, val code: String, val name: String)

/** Entri dalam manifest sinkronisasi — metadata SOP yang berubah sejak lastSyncAt. */
data class ManifestItem(
    val id: Int,
    val code: String,
    val title: String,
    val description: String?,
    val categoryId: Int,
    val version: Int,
    val status: String,
    val fileName: String?,
    val fileSize: Long?,
    val checksum: String?,
    val updatedAt: String,
    /** true = SOP diarsipkan di server → klien WAJIB menghapus dari perangkat */
    val deleted: Boolean = false
)

data class ManifestResponse(
    val success: Boolean,
    val data: ManifestData?
) {
    data class ManifestData(
        val serverTime: String,
        val items: List<ManifestItem>
    )
}
