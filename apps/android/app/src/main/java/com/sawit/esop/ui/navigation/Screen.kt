package com.sawit.esop.ui.navigation

/** Definisi rute layar aplikasi */
sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Home : Screen("home")
    data object Profile : Screen("profile")
    data object SopDetail : Screen("detail/{sopId}") {
        fun create(sopId: Int) = "detail/$sopId"
    }
}
