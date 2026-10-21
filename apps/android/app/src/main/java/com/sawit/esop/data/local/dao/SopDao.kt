package com.sawit.esop.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.sawit.esop.data.local.entity.CategoryEntity
import com.sawit.esop.data.local.entity.SopEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SopDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(sops: List<SopEntity>)

    @Query("SELECT * FROM sops ORDER BY categoryId, code")
    fun observeAll(): Flow<List<SopEntity>>

    @Query("SELECT * FROM sops WHERE id = :id")
    fun observeById(id: Int): Flow<SopEntity?>

    @Query("SELECT * FROM sops WHERE id = :id")
    suspend fun getById(id: Int): SopEntity?

    @Query("DELETE FROM sops WHERE id IN (:ids)")
    suspend fun deleteByIds(ids: List<Int>)

    @Query("DELETE FROM sops")
    suspend fun clearAll()
}

@Dao
interface CategoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(categories: List<CategoryEntity>)

    @Query("SELECT * FROM categories ORDER BY code")
    fun observeAll(): Flow<List<CategoryEntity>>

    @Query("DELETE FROM categories")
    suspend fun clearAll()
}
