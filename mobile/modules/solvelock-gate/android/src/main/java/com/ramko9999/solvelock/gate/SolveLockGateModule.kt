package com.ramko9999.solvelock.gate

import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SolveLockGateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SolveLockGate")

    Events("onForegroundApp", "onBlocked")

    Function("getForegroundApp") {
      mapOf(
        "packageName" to GateState.foregroundPackage,
        "changedAt" to GateState.changedAt.toDouble()
      )
    }

    AsyncFunction("getInstalledApps") {
      val context = appContext.reactContext
        ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      InstalledApps.list(context)
    }

    Function("getUsage") {
      val context = appContext.reactContext ?: return@Function null
      UsageCounter.snapshot(context)
    }

    Function("setGatedPackages") { packages: List<String> ->
      val context = appContext.reactContext ?: return@Function false
      UsageCounter.setGated(context, packages)
      true
    }

    Function("setQuotaMinutes") { minutes: Double ->
      val context = appContext.reactContext ?: return@Function false
      UsageCounter.setQuotaMinutes(context, minutes)
      true
    }

    Function("resetUsage") {
      val context = appContext.reactContext ?: return@Function false
      UsageCounter.reset(context)
      true
    }

    Function("getBlockedPackage") {
      GateState.blockedPackage
    }

    Function("clearBlocked") {
      GateState.blockedPackage = null
      true
    }

    Function("canDrawOverlays") {
      val context = appContext.reactContext ?: return@Function false
      Blocker.canDrawOverlays(context)
    }

    Function("openOverlaySettings") {
      val context = appContext.reactContext ?: return@Function false
      Blocker.openOverlaySettings(context)
      true
    }

    Function("launchApp") { packageName: String ->
      val context = appContext.reactContext ?: return@Function false
      Blocker.launch(context, packageName)
    }

    Function("isAccessibilityEnabled") {
      val context = appContext.reactContext ?: return@Function false
      GateState.isAccessibilityEnabled(context)
    }

    Function("openAccessibilitySettings") {
      val context = appContext.reactContext ?: return@Function false
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    }

    OnStartObserving {
      GateState.listener = { packageName, changedAt ->
        sendEvent(
          "onForegroundApp",
          mapOf("packageName" to packageName, "changedAt" to changedAt.toDouble())
        )
      }
      GateState.blockListener = { packageName ->
        sendEvent("onBlocked", mapOf("packageName" to packageName))
      }
    }

    OnStopObserving {
      GateState.listener = null
      GateState.blockListener = null
    }
  }
}
