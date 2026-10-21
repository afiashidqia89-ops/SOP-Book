package com.sawit.esop

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.*
import com.sawit.esop.ui.navigation.Screen
import com.sawit.esop.ui.screens.home.HomeScreen
import com.sawit.esop.ui.screens.login.LoginScreen
import com.sawit.esop.ui.screens.profile.ProfileScreen
import com.sawit.esop.ui.screens.sopdetail.SopDetailScreen
import com.sawit.esop.ui.theme.ESOPSawitTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as SopApplication).container

        setContent {
            ESOPSawitTheme {
                val session by container.authRepository.observeSession()
                    .collectAsState(initial = null)

                // Belum login → layar login; sudah login → aplikasi utama
                val startDestination = if (session == null) Screen.Login.route else Screen.Home.route

                val navController = rememberNavController()
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = backStackEntry?.destination

                Scaffold(
                    bottomBar = {
                        // Bottom nav hanya di layar utama (bukan login/detail)
                        val showBottomBar = currentDestination?.hierarchy?.any {
                            it.route == Screen.Home.route || it.route == Screen.Profile.route
                        } == true && session != null

                        if (showBottomBar) {
                            NavigationBar {
                                listOf(
                                    Triple("Daftar SOP", Icons.Default.Home, Screen.Home.route),
                                    Triple("Profil", Icons.Default.Person, Screen.Profile.route)
                                ).forEach { (label, icon, route) ->
                                    NavigationBarItem(
                                        selected = currentDestination?.hierarchy?.any { it.route == route } == true,
                                        onClick = {
                                            navController.navigate(route) {
                                                popUpTo(Screen.Home.route) { saveState = true }
                                                launchSingleTop = true
                                                restoreState = true
                                            }
                                        },
                                        icon = { Icon(icon, contentDescription = label) },
                                        label = { Text(label) }
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = startDestination,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Login.route) {
                            LoginScreen(
                                onLoginSuccess = {
                                    navController.navigate(Screen.Home.route) {
                                        popUpTo(Screen.Login.route) { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable(Screen.Home.route) {
                            HomeScreen(
                                onOpenSop = { id ->
                                    navController.navigate(Screen.SopDetail.create(id))
                                }
                            )
                        }
                        composable(Screen.SopDetail.route) { entry ->
                            val sopId = entry.arguments?.getString("sopId")?.toIntOrNull() ?: 0
                            SopDetailScreen(
                                sopId = sopId,
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable(Screen.Profile.route) {
                            ProfileScreen(
                                onLoggedOut = {
                                    navController.navigate(Screen.Login.route) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
