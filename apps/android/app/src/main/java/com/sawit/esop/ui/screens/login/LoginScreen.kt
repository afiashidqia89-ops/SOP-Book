package com.sawit.esop.ui.screens.login

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sawit.esop.SopApplication
import kotlinx.coroutines.launch

class LoginViewModel(private val auth: com.sawit.esop.data.repository.AuthRepository) : ViewModel() {
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun login(nik: String, password: String, onSuccess: () -> Unit) {
        if (nik.isBlank() || password.isBlank()) {
            error = "NIK dan password wajib diisi"
            return
        }
        viewModelScope.launch {
            loading = true
            error = null
            auth.login(nik, password)
                .onSuccess { onSuccess() }
                .onFailure { error = pesan(it) }
            loading = false
        }
    }

    private fun pesan(e: Throwable): String = when {
        e.message?.contains("Failed to connect", true) == true ||
                e.message?.contains("Unable to resolve", true) == true ->
            "Tidak dapat terhubung ke server. Periksa koneksi & alamat server."
        e.message?.contains("NIK atau password", true) == true -> e.message!!
        else -> e.message ?: "Login gagal, coba lagi"
    }
}

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val container = (androidx.compose.ui.platform.LocalContext.current.applicationContext as SopApplication).container
    val vm: LoginViewModel = viewModel(factory = viewModelFactory {
        initializer { LoginViewModel(container.authRepository) }
    })

    var nik by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("🌴", style = MaterialTheme.typography.displayLarge)
            Text("e-SOP Sawit", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.primary)
            Text("Media SOP & Instruksi Kerja Digital", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(32.dp))

            OutlinedTextField(
                value = nik, onValueChange = { nik = it },
                label = { Text("NIK / Username") },
                modifier = Modifier.fillMaxWidth(), singleLine = true
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Password") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(), singleLine = true
            )
            vm.error?.let {
                Spacer(Modifier.height(12.dp))
                Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
            Spacer(Modifier.height(24.dp))

            Button(
                onClick = { vm.login(nik, password, onLoginSuccess) },
                enabled = !vm.loading,
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                if (vm.loading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("Memproses…")
                } else Text("Masuk")
            }
            Spacer(Modifier.height(16.dp))
            Text(
                "Setelah login, SOP dapat diunduh & dibaca tanpa internet",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
