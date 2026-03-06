package com.pgg.vuelynxhost

import android.content.Context
import java.io.ByteArrayOutputStream
import java.net.URL

object LynxBundleLoader {
  fun loadBundle(context: Context): ByteArray {
    val remoteUrl = BuildConfig.PGG_LYNX_BUNDLE_URL
    if (remoteUrl.isNotBlank()) {
      return URL(remoteUrl).openStream().use { input ->
        input.readBytes()
      }
    }

    context.assets.open("main.lynx.bundle").use { input ->
      val buffer = ByteArrayOutputStream()
      val chunk = ByteArray(4096)
      var read = input.read(chunk)
      while (read >= 0) {
        if (read > 0) {
          buffer.write(chunk, 0, read)
        }
        read = input.read(chunk)
      }
      return buffer.toByteArray()
    }
  }

  fun baseUrl(): String {
    return BuildConfig.PGG_LYNX_BUNDLE_URL.ifBlank { "app://main.lynx.bundle" }
  }
}
