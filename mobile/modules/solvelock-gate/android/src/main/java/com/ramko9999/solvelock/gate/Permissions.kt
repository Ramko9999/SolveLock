package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings

/**
 * The three settings screens the parent has to visit. Each trip is a chance the
 * parent gives up, so we ask for nothing we do not use: the foreground app
 * comes from the accessibility service, not from usage access.
 */
object Permissions {
  fun status(context: Context): Map<String, Boolean> = mapOf(
    "accessibility" to GateState.isAccessibilityEnabled(context),
    "overlay" to Settings.canDrawOverlays(context),
    "battery" to ignoresBatteryLimits(context)
  )

  private fun ignoresBatteryLimits(context: Context): Boolean {
    val power = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
      ?: return false
    return power.isIgnoringBatteryOptimizations(context.packageName)
  }

  fun open(context: Context, id: String): Boolean {
    val self = Uri.parse("package:${context.packageName}")
    val intent = when (id) {
      // Android has no deep link to one service, so this is the whole list.
      "accessibility" -> Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      "overlay" -> Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, self)
      "battery" -> Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, self)
      else -> return false
    }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
    return true
  }
}
