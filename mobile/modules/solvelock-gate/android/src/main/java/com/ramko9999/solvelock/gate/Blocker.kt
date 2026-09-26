package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings

/**
 * Puts our screen in front of the gated app. Android stops most apps from
 * starting an Activity from the background; "display over other apps" is the
 * permission that lets us, and the setup screen asks for it.
 */
object Blocker {
  /**
   * One launch can fire two events, so ignore an immediate repeat. Keep this
   * short: an app with a splash screen takes focus back a moment later, and we
   * have to cover it again.
   */
  private const val QUIET_MILLIS = 400L

  @Volatile
  private var lastShownAt = 0L

  fun canDrawOverlays(context: Context): Boolean =
    Settings.canDrawOverlays(context)

  fun show(context: Context, packageName: String) {
    val now = System.currentTimeMillis()
    if (now - lastShownAt < QUIET_MILLIS) {
      return
    }
    lastShownAt = now

    GateState.blockedPackage = packageName
    GateState.blockListener?.invoke(packageName)

    val intent = context.packageManager
      .getLaunchIntentForPackage(context.packageName)
      ?: return
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    context.startActivity(intent)
  }

  fun openOverlaySettings(context: Context) {
    val intent = Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:${context.packageName}")
    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }

  /** Back to the game, which is the seam iOS cannot close. */
  fun launch(context: Context, packageName: String): Boolean {
    val intent = context.packageManager.getLaunchIntentForPackage(packageName)
      ?: return false
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
    return true
  }
}
