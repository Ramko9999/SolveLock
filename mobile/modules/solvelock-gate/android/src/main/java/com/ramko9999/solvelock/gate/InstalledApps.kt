package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream

/**
 * The apps a person can launch from the home screen. Android hides the rest
 * behind QUERY_ALL_PACKAGES, which has its own Play review form, so we ask only
 * for the launcher intent that the module manifest declares.
 */
object InstalledApps {
  private const val ICON_PIXELS = 96

  fun list(context: Context): List<Map<String, Any?>> {
    val packages = context.packageManager
    val launchable = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)

    return packages
      .queryIntentActivities(launchable, 0)
      .asSequence()
      .map { it.activityInfo.applicationInfo }
      .distinctBy { it.packageName }
      .filter { it.packageName != context.packageName }
      .map { app ->
        mapOf(
          "packageName" to app.packageName,
          "label" to packages.getApplicationLabel(app).toString(),
          "icon" to encode(packages.getApplicationIcon(app))
        )
      }
      .sortedBy { (it["label"] as String).lowercase() }
      .toList()
  }

  /** A data URI, because JS cannot hold a Drawable and <Image> reads this. */
  private fun encode(icon: Drawable): String? {
    return try {
      val bitmap = Bitmap.createBitmap(ICON_PIXELS, ICON_PIXELS, Bitmap.Config.ARGB_8888)
      icon.setBounds(0, 0, ICON_PIXELS, ICON_PIXELS)
      icon.draw(Canvas(bitmap))
      val png = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, png)
      bitmap.recycle()
      "data:image/png;base64," + Base64.encodeToString(png.toByteArray(), Base64.NO_WRAP)
    } catch (error: Exception) {
      null
    }
  }
}
