package com.sawit.esop.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.sawit.esop.data.local.entity.UserEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    /** Selalu maksimal 1 baris sesi login di tabel ini. */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun save(user: UserEntity)

    @Query("SELECT * FROM session_user LIMIT 1")
    fun observe(): Flow<UserEntity?>

    @Query("SELECT * FROM session_user LIMIT 1")
    suspend fun get(): UserEntity?

    @Query("DELETE FROM session_user")
    suspend fun clear()
}
