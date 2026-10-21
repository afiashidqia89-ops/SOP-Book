package com.sawit.esop.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Refresh
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
import com.sawit.esop.data.local.entity.CategoryEntity
import com.sawit.esop.data.local.entity.SopEntity
import com.sawit.esop.data.repository.SopRepository
import com.sawit.esop.sync.SyncWorker
import com.sawit.esop.util.viewModelFactory
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.NetworkType
import androidx.work.Constraints
import androidx.work.WorkManager
import kotlinx.coroutines.launch

class HomeViewModel(private val repo: SopRepository) : ViewModel() {
    val sops: StateFlow<List<SopEntity>> = repo.observeSops()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val categories: StateFlow<List<CategoryEntity>> = repo.observeCategories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    var syncing by mutableStateOf(false)
        private set
    var syncMessage by mutableStateOf<String?>(null)
        private set

    /** Trigger sync manual — jalankan SyncWorker satu kali (butuh koneksi). */
    fun refresh(context: Context) {
        syncing = true
        val request = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(context).enqueue(request)
        viewModelScope.launch {
            kotlinx.coroutines.delay(4000) // indikator sederhana; hasil terlihat lewat Flow Room
            syncing = false
            syncMessage = "Sinkronisasi selesai — daftar di bawah adalah data terbaru di perangkat"
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(onOpenSop: (Int) -> Unit) {
    val context = LocalContext.current
    val container = context.applicationContext as SopApplication
    val vm: HomeViewModel = viewModel(factory = viewModelFactory { HomeViewModel(container.sopRepository) })

    var selectedCategoryId by remember { mutableIntStateOf(-1) } // -1 = semua

    val sops by vm.sops.collectAsState()
    val categories by vm.categories.collectAsState()

    val filtered = remember(sops, selectedCategoryId) {
        if (selectedCategoryId == -1) sops else sops.filter { it.categoryId == selectedCategoryId }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Daftar SOP") },
                actions = {
                    IconButton(onClick = { vm.refresh(context) }, enabled = !vm.syncing) {
                        if (vm.syncing) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                        else Icon(Icons.Default.Refresh, "Sinkronkan")
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.padding(padding)) {
            // Banner status: jika kategori kosong → belum pernah sync (offline murni)
            if (categories.isEmpty() && sops.isEmpty()) {
                Surface(color = MaterialTheme.colorScheme.errorContainer, modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CloudOff, null)
                        Spacer(Modifier.width(8.dp))
                        Text("Belum ada data offline. Sambungkan internet lalu tekan tombol refresh.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            // Filter kategori (PN/PM/SP/IR/QM/K3) — tersimpan offline
            LazyRow(Modifier.padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = selectedCategoryId == -1,
                        onClick = { selectedCategoryId = -1 },
                        label = { Text("Semua") }
                    )
                }
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategoryId == cat.id,
                        onClick = { selectedCategoryId = cat.id },
                        label = { Text("${cat.code} — ${cat.name}") }
                    )
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filtered, key = { it.id }) { sop ->
                    SopCard(sop, onClick = { onOpenSop(sop.id) })
                }
                if (filtered.isEmpty()) {
                    item {
                        Text(
                            "Tidak ada SOP pada kategori ini.",
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SopCard(sop: SopEntity, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Default.Description, null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(sop.title, style = MaterialTheme.typography.titleMedium)
                Text(
                    "${sop.code} • v${sop.version}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            // Badge ketersediaan offline
            AssistChip(
                onClick = {},
                label = { Text(if (sop.localPath != null) "Offline ✓" else "Belum diunduh") }
            )
        }
    }
}
