package com.sawit.esop.ui.screens.sopdetail

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import com.github.barteksc.pdfviewer.PDFView
import com.sawit.esop.SopApplication
import com.sawit.esop.util.viewModelFactory
import androidx.lifecycle.ViewModel
import java.io.File

class SopDetailViewModel(private val repo: com.sawit.esop.data.repository.SopRepository) : ViewModel() {
    fun sop(id: Int) = repo.observeSop(id)
}

/**
 * Pembaca PDF SOP — membuka file yang TERSIMPAN OFFLINE di storage internal.
 * Library: android-pdf-viewer (mhiew fork). Sepenuhnya berfungsi tanpa internet.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SopDetailScreen(sopId: Int, onBack: () -> Unit) {
    val context = LocalContext.current
    val container = context.applicationContext as SopApplication
    val vm: SopDetailViewModel = viewModel(factory = viewModelFactory { SopDetailViewModel(container.sopRepository) })

    val sop by vm.sop(sopId).collectAsState(initial = null)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(sop?.title ?: "SOP", maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Kembali")
                    }
                }
            )
        }
    ) { padding ->
        val localPath = sop?.localPath
        if (localPath != null && File(localPath).exists()) {
            // Tampilkan PDF dari file lokal — TANPA internet
            AndroidView(
                factory = { ctx ->
                    PDFView(ctx, null).apply {
                        fromFile(File(localPath))
                            .enableSwipe(true)
                            .enableDoubletap(true)
                            .load()
                    }
                },
                modifier = Modifier.fillMaxSize().padding(padding)
            )
        } else {
            Column(
                modifier = Modifier.fillMaxSize().padding(padding).padding(32.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(Icons.Default.CloudOff, null, modifier = Modifier.size(56.dp))
                Spacer(Modifier.height(16.dp))
                Text("File SOP belum tersedia di perangkat")
                Spacer(Modifier.height(8.dp))
                Text(
                    "Sambungkan internet, buka daftar SOP, lalu tekan tombol refresh untuk mengunduh.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
