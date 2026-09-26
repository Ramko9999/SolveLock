package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.provider.Settings

/**
 * Opens the app, and relaunches the game afterwards. The covering itself lives
 * in [BlockOverlay] -- starting an Activity over the game is a race we cannot
 * win, because a launch is a sequence of Activity starts and the last one wins.
 */
object Blocker {
  fun canDrawOverlays(context: Context): Boolean =
    Settings.canDrawOverlays(context)

  /** Called when the child taps Start on the overlay, so nothing races us. */
  fun openProblems(context: Context, packageName: String) {
    GateState.blockedPackage = packageName
    GateState.blockListener?.invoke(packageName)

    val intent = context.packageManager
      .getLaunchIntentForPackage(context.packageName)
      ?: return
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    Log.d("SolveLockGate", "opening problems for $packageName")
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
