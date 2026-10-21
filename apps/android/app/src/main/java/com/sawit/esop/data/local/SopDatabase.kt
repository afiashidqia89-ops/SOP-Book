package com.sawit.esop.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.sawit.esop.data.local.dao.CategoryDao
import com.sawit.esop.data.local.dao.SopDao
import com.sawit.esop.data.local.dao.UserDao
import com.sawit.esop.data.local.entity.CategoryEntity
import com.sawit.esop.data.local.entity.SopEntity
import com.sawit.esop.data.local.entity.UserEntity

/**
 * Database offline aplikasi — SINGLE SOURCE OF TRUTH bagi UI.
 * Seluruh layar Compose membaca dari Room, bukan dari API langsung,
 * sehingga semua fitur tetap berjalan saat perangkat tidak punya sinyal.
 */
@Database(
    entities = [SopEntity::class, CategoryEntity::class, UserEntity::class],
    version = 1,
    exportSchema = false
)
abstract class SopDatabase : RoomDatabase() {
    abstract fun sopDao(): SopDao
    abstract fun categoryDao(): CategoryDao
    abstract fun userDao(): UserDao

    companion object {
        @Volatile private var INSTANCE: SopDatabase? = null

        fun getInstance(context: Context): SopDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    SopDatabase::class.java,
                    "esop_sawit.db"
                ).fallbackToDestructiveMigration().build().also { INSTANCE = it }
            }
    }
}
