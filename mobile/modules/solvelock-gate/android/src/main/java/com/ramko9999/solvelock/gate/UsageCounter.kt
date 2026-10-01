package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.SharedPreferences

/**
 * Minutes the child spends in the gated apps. Unlike iOS, we own this number,
 * so we can show it to the child.
 *
 * The count is usage, not wall-clock: it runs only while a gated app is in
 * front and the screen is on. It lives in SharedPreferences because Android can
 * kill the process, and a child who reboots the phone must not get a free hour.
 */
object UsageCounter {
  private const val PREFS = "solvelock-gate"
  private const val KEY_USED = "used-millis"
  private const val KEY_GATED = "gated-packages"
  private const val KEY_CATEGORIES = "gated-categories"
  private const val KEY_QUOTA = "quota-millis"
  private const val KEY_PROBLEMS = "problems-per-check"

  private const val DEFAULT_QUOTA_MILLIS = 30L * 60L * 1000L

  @Volatile
  private var usedMillis = 0L

  @Volatile
  private var gated: Set<String> = emptySet()

  /**
   * Whole categories the parent ticked. We keep the rule rather than the apps
   * it matched, so a game the child installs next week is gated the moment it
   * opens. Expanding at pick time would miss it.
   */
  @Volatile
  private var gatedCategories: Set<Int> = emptySet()

  @Volatile
  private var quotaMillis = DEFAULT_QUOTA_MILLIS

  /** Only so the cover can promise the number the child will actually face. */
  @Volatile
  private var problemsPerCheck = 3

  /** When the child entered the gated app they are in now. 0 means none. */
  @Volatile
  private var since = 0L

  private var loaded = false

  private fun prefs(context: Context): SharedPreferences =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  @Synchronized
  private fun load(context: Context) {
    if (loaded) {
      return
    }
    val store = prefs(context)
    usedMillis = store.getLong(KEY_USED, 0L)
    quotaMillis = store.getLong(KEY_QUOTA, DEFAULT_QUOTA_MILLIS)
    problemsPerCheck = store.getInt(KEY_PROBLEMS, 3)
    gated = store.getStringSet(KEY_GATED, emptySet()) ?: emptySet()
    gatedCategories = (store.getStringSet(KEY_CATEGORIES, emptySet()) ?: emptySet())
      .mapNotNull { it.toIntOrNull() }
      .toSet()
    loaded = true
  }

  @Synchronized
  fun setGated(context: Context, packages: List<String>) {
    load(context)
    // A package that leaves the gated set must not keep its clock running.
    stopClock()
    gated = packages.toSet()
    prefs(context).edit().putStringSet(KEY_GATED, gated).apply()
  }

  @Synchronized
  fun setProblemsPerCheck(context: Context, count: Int) {
    load(context)
    problemsPerCheck = Math.max(1, count)
    prefs(context).edit().putInt(KEY_PROBLEMS, problemsPerCheck).apply()
  }

  @Synchronized
  fun problemsPerCheck(context: Context): Int {
    load(context)
    return problemsPerCheck
  }

  @Synchronized
  fun setGatedCategories(context: Context, values: List<Int>) {
    load(context)
    stopClock()
    gatedCategories = values.toSet()
    prefs(context)
      .edit()
      .putStringSet(KEY_CATEGORIES, gatedCategories.map { it.toString() }.toSet())
      .apply()
  }

  /** Ticked directly, or covered by a ticked category. */
  private fun isGated(context: Context, packageName: String): Boolean {
    if (gated.contains(packageName)) {
      return true
    }
    return gatedCategories.isNotEmpty() &&
      gatedCategories.contains(InstalledApps.categoryOf(context, packageName))
  }

  @Synchronized
  fun setQuotaMinutes(context: Context, minutes: Double) {
    load(context)
    quotaMillis = (minutes * 60_000.0).toLong()
    prefs(context).edit().putLong(KEY_QUOTA, quotaMillis).apply()
  }

  @Synchronized
  fun reset(context: Context) {
    load(context)
    usedMillis = 0L
    since = if (since > 0L) System.currentTimeMillis() else 0L
    prefs(context).edit().putLong(KEY_USED, 0L).apply()
  }

  /** The foreground app changed, or the screen went off (a null package). */
  @Synchronized
  fun onForeground(context: Context, packageName: String?) {
    load(context)
    val entering = packageName != null && isGated(context, packageName)
    if (entering && since > 0L) {
      return
    }
    stopClock()
    if (entering) {
      since = System.currentTimeMillis()
    } else {
      save(context)
    }
  }

  /** Banks the time of the session in progress, if there is one. */
  private fun stopClock() {
    if (since == 0L) {
      return
    }
    usedMillis += System.currentTimeMillis() - since
    since = 0L
  }

  private fun save(context: Context) {
    prefs(context).edit().putLong(KEY_USED, usedMillis).apply()
  }

  fun inSession(): Boolean = since > 0L

  /**
   * Banks the minutes so far without ending the session, so the running total
   * reaches disk. A crash then costs seconds, not the whole session.
   */
  @Synchronized
  fun flush(context: Context) {
    load(context)
    if (since == 0L) {
      return
    }
    val now = System.currentTimeMillis()
    usedMillis += now - since
    since = now
    save(context)
  }

  /** Milliseconds of quota left, counting the session in progress. */
  @Synchronized
  fun remaining(context: Context): Long {
    load(context)
    val live = if (since > 0L) System.currentTimeMillis() - since else 0L
    return Math.max(0L, quotaMillis - (usedMillis + live))
  }

  @Synchronized
  fun quotaMillis(context: Context): Long {
    load(context)
    return quotaMillis
  }

  @Synchronized
  fun quotaMinutes(context: Context): Int {
    load(context)
    return Math.max(1, Math.round(quotaMillis / 60_000.0).toInt())
  }

  @Synchronized
  fun shouldBlock(context: Context, packageName: String?): Boolean {
    load(context)
    if (packageName == null || !isGated(context, packageName)) {
      return false
    }
    val live = if (since > 0L) System.currentTimeMillis() - since else 0L
    return usedMillis + live >= quotaMillis
  }

  @Synchronized
  fun snapshot(context: Context): Map<String, Any?> {
    load(context)
    val live = if (since > 0L) System.currentTimeMillis() - since else 0L
    val used = usedMillis + live
    return mapOf(
      "usedMillis" to used.toDouble(),
      "quotaMillis" to quotaMillis.toDouble(),
      "over" to (used >= quotaMillis),
      "inGatedApp" to (since > 0L),
      "gatedPackages" to gated.toList(),
      "gatedCategories" to gatedCategories.toList()
    )
  }
}
