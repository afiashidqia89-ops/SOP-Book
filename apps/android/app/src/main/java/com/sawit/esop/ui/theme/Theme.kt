package com.sawit.esop.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Palet warna perkebunan kelapa sawit
val PalmGreen = Color(0xFF2F6418)
val PalmDark = Color(0xFF1F4112)
val PalmLight = Color(0xFFE0EFDB)
val TbsOrange = Color(0xFFE85D04) // warna TBS (tandan buah segar)

private val LightColors = lightColorScheme(
    primary = PalmGreen,
    onPrimary = Color.White,
    primaryContainer = PalmLight,
    secondary = TbsOrange,
    background = Color(0xFFF8FAF6),
    surface = Color.White
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9BC67D),
    secondary = TbsOrange
)

@Composable
fun ESOPSawitTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content
    )
}
