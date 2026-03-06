package com.pgg.vuelynxhost

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

// Replace the commented LynxView integration with your environment's exact imports.
class MainActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val bundleBytes = LynxBundleLoader.loadBundle(this)

    // val lynxView = LynxViewBuilder().build(this)
    // setContentView(lynxView)
    // lynxView.renderTemplateWithBaseUrl(bundleBytes, TemplateData.empty(), LynxBundleLoader.baseUrl())

    if (bundleBytes.isEmpty()) {
      finish()
    }
  }
}
