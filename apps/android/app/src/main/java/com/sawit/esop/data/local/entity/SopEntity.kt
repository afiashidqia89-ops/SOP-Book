package com.sawit.esop.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/** Dokumen SOP tersimpan offline di perangkat — sumber data UI (single source of truth). */
@Entity(tableName = "sops")
data class SopEntity(
    @PrimaryKey val id: Int,               // id dari server
    val code: String,                      // SOP-PN-001
    val title: String,
    val description: String?,
    val categoryId: Int,
    val version: Int,                      // versi dokumen dari server
    val fileName: String?,
    val fileSize: Long?,
    val checksum: String?,                 // SHA-256 untuk verifikasi integritas file
    val localPath: String?,                // path PDF di storage internal (null = belum terunduh)
    val updatedAt: String,                 // ISO timestamp dari server
    val lastSyncedAt: String               // kapan SOP ini terakhir disinkron
)

/** Kategori/divisi SOP — di-cache agar daftar tetap tampil saat offline. */
@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: Int,
    val code: String,                      // PN, PM, SP, IR, QM, K3
    val name: String                       // Panen, Pemupukan, ...
)

/** Satu-satunya baris sesi user yang sedang login. */
@Entity(tableName = "session_user")
data class UserEntity(
    @PrimaryKey val id: Int,
    val nik: String,
    val name: String,
    val role: String,                      // SUPERADMIN | MANAGER | ASSISTANT | FOREMAN | WORKER
    val division: String?,
    val estate: String?
)
