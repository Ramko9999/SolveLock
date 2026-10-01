package com.ramko9999.solvelock.gate

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * The watcher. Android binds this and keeps it alive, so we need no foreground
 * service, no permanent notification, and no polling -- the system tells us the
 * instant the foreground window changes.
 */
class SolveLockAccessibilityService : AccessibilityService() {
  /** How often we bank progress to disk while the child is playing. */
  private val flushMillis = 10_000L

  private val handler = Handler(Looper.getMainLooper())

  /**
   * Window events alone cannot enforce a quota. A game that stays on one
   * screen fires nothing, so the child runs past it; a game that changes
   * screens fires at a random moment, so the cover lands mid-match. This runs
   * on its own clock instead, and lands on the quota exactly.
   */
  private val tick = object : Runnable {
    override fun run() {
      val service = this@SolveLockAccessibilityService
      UsageCounter.flush(service)
      val playing = GateState.foregroundPackage
      if (playing != null && UsageCounter.shouldBlock(service, playing)) {
        cover(playing)
        return
      }
      schedule()
    }
  }

  /** Wake at the quota, or at the next flush, whichever comes first. */
  private fun schedule() {
    handler.removeCallbacks(tick)
    if (!UsageCounter.inSession()) {
      return
    }
    val remaining = UsageCounter.remaining(this)
    handler.postDelayed(tick, minOf(flushMillis, maxOf(remaining, 250L)))
  }

  /** A phone in a pocket is not a child playing, so stop the clock. */
  private val screenOff = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      GateState.report(null)
      UsageCounter.onForeground(this@SolveLockAccessibilityService, null)
      BlockOverlay.hide()
      handler.removeCallbacks(tick)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    registerReceiver(screenOff, IntentFilter(Intent.ACTION_SCREEN_OFF))
  }

  override fun onUnbind(intent: Intent?): Boolean {
    handler.removeCallbacks(tick)
    UsageCounter.onForeground(this, null)
    BlockOverlay.hide()
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
    val over = UsageCounter.shouldBlock(this, packageName)
    if (GateState.report(packageName)) {
      UsageCounter.onForeground(this, packageName)
    }
    // The overlay is a window of ours, so it reports itself. Reading that as
    // "the child left the game" makes us hide the cover we just added, and the
    // pair flickers many times a second. Our own windows never move the cover.
    if (packageName == getPackageName()) {
      // Our Activity reaching the front is the only safe moment to drop the
      // cover. Hiding it when the child taps Start shows them the game for a
      // few frames while React Native starts. The overlay reports itself too,
      // so tell the two apart by class.
      // The window exists before it has drawn, so dropping the cover here
      // shows the game for a frame. The problems screen calls dismissCover as
      // soon as it mounts; this is only the fallback for when it does not.
      if (event.className?.toString()?.endsWith("MainActivity") == true) {
        handler.postDelayed({ BlockOverlay.hide() }, 1500L)
      }
      return
    }
    if (over) {
      cover(packageName)
    } else {
      // Home, the launcher, or any app we do not gate. Get out of the way.
      BlockOverlay.hide()
    }
    schedule()
  }

  private fun cover(packageName: String) {
    if (!BlockOverlay.isShowing()) {
      CoverLog.record(this, packageName, UsageCounter.quotaMillis(this))
    }
    BlockOverlay.show(
      this,
      UsageCounter.quotaMinutes(this),
      UsageCounter.problemsPerCheck(this),
    ) {
      Blocker.openProblems(this, packageName)
    }
  }

  override fun onInterrupt() = Unit
}
