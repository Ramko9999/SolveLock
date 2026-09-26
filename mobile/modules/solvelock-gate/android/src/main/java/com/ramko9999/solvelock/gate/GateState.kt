package com.ramko9999.solvelock.gate

import android.content.Context
import android.provider.Settings
import android.text.TextUtils

/**
 * Shared between the accessibility service and the Expo module. Both run in the
 * app process, so plain memory is enough -- nothing here needs to outlive it.
 */
object GateState {
  const val SERVICE_ID = "com.ramko9999.solvelock/com.ramko9999.solvelock.gate.SolveLockAccessibilityService"

  @Volatile
  var foregroundPackage: String? = null
    private set

  /** Wall-clock at the moment the service saw the change, not when JS asked. */
  @Volatile
  var changedAt: Long = 0
    private set

  var listener: ((String?, Long) -> Unit)? = null

  /**
   * The gated app the child tried to open after the quota ran out. The screens
   * read this instead of a deep link: the development client swallows our URL
   * scheme, and a flag the app reads on resume works whether the app was
   * running or not.
   */
  @Volatile
  var blockedPackage: String? = null

  var blockListener: ((String) -> Unit)? = null

  /** True when this is a change, so the caller can act on it once. */
  fun report(packageName: String?): Boolean {
    if (packageName == foregroundPackage) {
      return false
    }
    foregroundPackage = packageName
    changedAt = System.currentTimeMillis()
    listener?.invoke(packageName, changedAt)
    return true
  }

  fun isAccessibilityEnabled(context: Context): Boolean {
    val enabled = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    ) ?: return false
    val splitter = TextUtils.SimpleStringSplitter(':')
    splitter.setString(enabled)
    while (splitter.hasNext()) {
      if (splitter.next().equals(SERVICE_ID, ignoreCase = true)) {
        return true
      }
    }
    return false
  }
}
