package com.sawit.esop.util

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

/** Factory ringan untuk ViewModel dengan dependensi manual (tanpa Hilt). */
inline fun <reified VM : ViewModel> viewModelFactory(
    crossinline initializer: () -> VM
): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = initializer() as T
}
