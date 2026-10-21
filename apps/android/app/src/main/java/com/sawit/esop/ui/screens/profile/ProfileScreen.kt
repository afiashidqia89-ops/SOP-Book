package com.sawit.esop.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sawit.esop.SopApplication
import com.sawit.esop.data.local.entity.UserEntity
import com.sawit.esop.data.repository.AuthRepository
import com.sawit.esop.data.repository.SopRepository
import com.sawit.esop.sync.SyncWorker
import com.sawit.esop.util.viewModelFactory
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ProfileViewModel(
    private val auth: AuthRepository,
    private val sopRepo: SopRepository
) : ViewModel() {
    val session: kotlinx.coroutines.flow.StateFlow<UserEntity?> =
        auth.observeSession().stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000), null)

    fun lastSyncText(): String {
        val ts = sopRepo.lastSyncAt()
        if (ts == 0L) return "Belum pernah sinkron"
        return SimpleDateFormat("dd MMM yyyy HH:mm", Locale("id", "ID")).format(Date(ts)) + " WIB"
    }

    fun triggerSync(context: android.content.Context) {
        val request = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(context).enqueue(request)
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            auth.logout()
            onDone()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(onLoggedOut: () -> Unit) {
    val context = LocalContext.current
    val container = context.applicationContext as SopApplication
    val vm: ProfileViewModel = viewModel(factory = viewModelFactory {
        ProfileViewModel(container.authRepository, container.sopRepository)
    })

    val user by vm.session.collectAsState()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Profil") }) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Text(user?.name ?: "-", style = MaterialTheme.typography.titleLarge)
                    Text("NIK: ${user?.nik ?: "-"}", style = MaterialTheme.typography.bodyMedium)
                    Text("Role: ${user?.role ?: "-"}", style = MaterialTheme.typography.bodyMedium)
                    Text("Divisi: ${user?.division ?: "-"} • Kebun: ${user?.estate ?: "-"}", style = MaterialTheme.typography.bodyMedium)
                }
            }

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Sinkronisasi Data", style = MaterialTheme.typography.titleMedium)
                    Text("Terakhir sync: ${vm.lastSyncText()}", style = MaterialTheme.typography.bodySmall)
                    Button(onClick = { vm.triggerSync(context) }, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Default.CloudSync, null)
                        Spacer(Modifier.width(8.dp))
                        Text("Sinkronkan Sekarang")
                    }
                    Text(
                        "SOP yang sudah diunduh tersimpan di perangkat dan tetap dapat dibuka tanpa internet.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            OutlinedButton(
                onClick = { vm.logout(onLoggedOut) },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
            ) {
                Icon(Icons.Default.Logout, null)
                Spacer(Modifier.width(8.dp))
                Text("Keluar (hapus data offline)")
            }
        }
    }
}
