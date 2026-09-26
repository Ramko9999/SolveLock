package com.ramko9999.solvelock.gate

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.view.accessibility.AccessibilityEvent

/**
 * The watcher. Android binds this and keeps it alive, so we need no foreground
 * service, no permanent notification, and no polling -- the system tells us the
 * instant the foreground window changes.
 */
class SolveLockAccessibilityService : AccessibilityService() {
  /** A phone in a pocket is not a child playing, so stop the clock. */
  private val screenOff = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      GateState.report(null)
      UsageCounter.onForeground(this@SolveLockAccessibilityService, null)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    registerReceiver(screenOff, IntentFilter(Intent.ACTION_SCREEN_OFF))
  }

  override fun onUnbind(intent: Intent?): Boolean {
    UsageCounter.onForeground(this, null)
    try {
      unregisterReceiver(screenOff)
    } catch (error: IllegalArgumentException) {
      // Never registered, because onServiceConnected did not run.
    }
    return super.onUnbind(intent)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      return
    }
    val packageName = event.packageName?.toString() ?: return
    // Window changes inside the system UI are not app launches.
    if (packageName == "com.android.systemui") {
      return
    }
    if (GateState.report(packageName)) {
      UsageCounter.onForeground(this, packageName)
    }
  }

  override fun onInterrupt() = Unit
}
