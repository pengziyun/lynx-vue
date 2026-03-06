package com.pgg.vuelynxhost

import android.app.Application

// Replace imports with the exact Lynx SDK packages used in your environment.
class VueLynxApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    initLynxService()
    initLynxEnv()
  }

  private fun initLynxService() {
    // LynxServiceCenter.inst().registerService(LynxDevToolService.getINSTANCE())
    // LynxDevToolService.getINSTANCE().setLynxDebugPresetValue(true)
    // LynxDevToolService.getINSTANCE().setLogBoxPresetValue(true)
    // LynxDevToolService.getINSTANCE().setLoadJsBridge(true)
  }

  private fun initLynxEnv() {
    // LynxEnv.inst().init(this, null, null, null)
    // LynxEnv.inst().enableLynxDebug(true)
    // LynxEnv.inst().enableDevtool(true)
    // LynxEnv.inst().enableLogBox(true)
  }
}
