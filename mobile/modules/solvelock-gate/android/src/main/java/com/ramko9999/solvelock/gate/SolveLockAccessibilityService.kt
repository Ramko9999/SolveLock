package com.ramko9999.solvelock.gate

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

/**
 * The watcher. Android binds this and keeps it alive, so we need no foreground
 * service, no permanent notification, and no polling -- the system tells us the
 * instant the foreground window changes.
 */
class SolveLockAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      return
    }
    val packageName = event.packageName?.toString() ?: return
    // Window changes inside the system UI are not app launches.
    if (packageName == "com.android.systemui") {
      return
    }
    GateState.report(packageName)
  }

  override fun onInterrupt() = Unit
}
