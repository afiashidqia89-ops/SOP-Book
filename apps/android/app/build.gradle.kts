plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.sawit.esop"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sawit.esop"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Alamat backend API diambil dari gradle.properties (BASE_URL=...)
        // sehingga URL bisa diubah lewat editor web GitHub TANPA Android Studio:
        // edit gradle.properties → commit → GitHub Actions membangun APK baru.
        val backendUrl = (project.findProperty("BASE_URL") as String?) ?: "http://10.0.2.2:3001/api/"
        buildConfigField("String", "API_BASE_URL", "\"$backendUrl\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // TODO produksi: signing config + BASE_URL HTTPS
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    // Compose UI
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    debugImplementation(libs.androidx.ui.tooling)

    // Offline database (Room) — sumber data utama aplikasi
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Jaringan (Retrofit + OkHttp)
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)

    // Sinkronisasi latar belakang (WorkManager)
    implementation(libs.androidx.work.runtime.ktx)

    // Penyimpanan token terenkripsi
    implementation(libs.androidx.security.crypto)

    // Pembaca PDF offline
    implementation(libs.pdf.viewer)

    implementation(libs.androidx.core.ktx)
}
