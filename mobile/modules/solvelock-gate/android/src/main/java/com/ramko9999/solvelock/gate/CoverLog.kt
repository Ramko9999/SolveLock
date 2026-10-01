package com.ramko9999.solvelock.gate

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Every time the cover goes up, written down with the moment it happened.
 *
 * The service raises the cover while the app's Activity is usually dead, so
 * there is no JavaScript alive to report it. Reporting from the screens
 * instead would only ever record the covers the child answered, and lose every
 * cover they walked away from -- which is the half worth knowing about.
 *
 * So the service writes here, and the app drains the queue the next time it
 * runs. The timestamp travels with the entry, so a late drain still reports
 * when the cover actually appeared.
 */
object CoverLog {
  private const val PREFS = "solvelock-gate"
  private const val KEY = "cover-log"

  /** A child who never opens the app must not grow this without bound. */
  private const val LIMIT = 200

  @Synchronized
  fun record(context: Context, packageName: String, quotaMillis: Long) {
    val store = context.applicationContext
      .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val queue = read(store.getString(KEY, null))

    queue.put(
      JSONObject()
        .put("package", packageName)
        .put("at", System.currentTimeMillis())
        .put("quotaMillis", quotaMillis),
    )

    val trimmed = JSONArray()
    val from = Math.max(0, queue.length() - LIMIT)
    for (slot in from until queue.length()) {
      trimmed.put(queue.get(slot))
    }
    store.edit().putString(KEY, trimmed.toString()).apply()
  }

  /** Hands over everything and empties the queue in one step. */
  @Synchronized
  fun drain(context: Context): List<Map<String, Any?>> {
    val store = context.applicationContext
      .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val queue = read(store.getString(KEY, null))
    store.edit().remove(KEY).apply()

    val out = mutableListOf<Map<String, Any?>>()
    for (slot in 0 until queue.length()) {
      val entry = queue.optJSONObject(slot) ?: continue
      out.add(
        mapOf(
          "packageName" to entry.optString("package"),
          "at" to entry.optLong("at").toDouble(),
          "quotaMillis" to entry.optLong("quotaMillis").toDouble(),
        ),
      )
    }
    return out
  }

  private fun read(raw: String?): JSONArray =
    try {
      if (raw.isNullOrEmpty()) JSONArray() else JSONArray(raw)
    } catch (error: Exception) {
      JSONArray()
    }
}
