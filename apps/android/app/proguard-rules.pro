# Aturan ProGuard/R8 untuk rilis produksi

# PDF viewer
-keep class com.github.barteksc.pdfviewer.** { *; }
-keep class com.shockwave.** { *; }

# Gson DTO — jangan obfuscate nama field agar JSON tetap terbaca
-keepclassmembers class com.sawit.esop.data.remote.dto.** { *; }

# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn okhttp3.**
-dontwarn okio.**
