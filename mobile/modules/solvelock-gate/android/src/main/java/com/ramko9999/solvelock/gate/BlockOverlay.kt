package com.ramko9999.solvelock.gate

import android.content.Context
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * The block screen, drawn as a window on top of everything.
 *
 * The earlier version started our Activity over the game and lost: a launch is
 * a *sequence* of Activity starts (Chrome's splash started 108ms after our
 * cover), and the last start wins. An overlay window sits above every Activity,
 * so the game can start as many as it likes underneath and none of them reach
 * the front. There is no race left to lose.
 *
 * It covers the gated app only. The child can still press Home and leave -- we
 * gate an app, we do not cage a child.
 */
object BlockOverlay {
  private const val INDIGO = "#4C5BD4"

  private var view: View? = null
  private var windows: WindowManager? = null

  fun isShowing(): Boolean = view != null

  fun show(context: Context, quotaMinutes: Int, problems: Int, onStart: () -> Unit) {
    if (view != null) {
      return
    }
    val manager = context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
      ?: return

    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
    }

    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      // No NOT_TOUCHABLE and no NOT_TOUCH_MODAL: every touch must stop here,
      // or the child taps the game through us.
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.OPAQUE
    )

    val content = build(context, quotaMinutes, problems, onStart)
    return try {
      manager.addView(content, params)
      view = content
      windows = manager
    } catch (error: Exception) {
      // The permission can be revoked while we run. Say nothing and let the
      // next event try again.
    }
  }

  fun hide() {
    val current = view ?: return
    try {
      windows?.removeView(current)
    } catch (error: Exception) {
      // Already gone.
    }
    view = null
    windows = null
  }

  private fun isDark(context: Context): Boolean =
    (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
      Configuration.UI_MODE_NIGHT_YES

  private fun dp(context: Context, value: Float): Int = TypedValue.applyDimension(
    TypedValue.COMPLEX_UNIT_DIP, value, context.resources.displayMetrics
  ).toInt()

  private fun build(
    context: Context,
    quotaMinutes: Int,
    problems: Int,
    onStart: () -> Unit
  ): View {
    val dark = isDark(context)
    val pageColor = Color.parseColor(if (dark) "#111111" else "#FFFFFF")
    val primary = Color.parseColor(if (dark) "#FFFFFF" else "#000000")
    val muted = Color.parseColor("#8E8E93")
    val accent = Color.parseColor(if (dark) "#8592F0" else INDIGO)

    val root = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(pageColor)
      setPadding(dp(context, 24f), dp(context, 72f), dp(context, 24f), dp(context, 40f))
      isClickable = true
    }

    root.addView(TextView(context).apply {
      text = "$quotaMinutes ${if (quotaMinutes == 1) "minute" else "minutes"}."
      setTextColor(primary)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 44f)
      typeface = android.graphics.Typeface.DEFAULT_BOLD
    })

    root.addView(TextView(context).apply {
      text = "Solve $problems and you're back in."
      setTextColor(muted)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
    })

    root.addView(View(context), LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f
    ))

    root.addView(Button(context).apply {
      text = "Start"
      setTextColor(Color.WHITE)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      isAllCaps = false
      stateListAnimator = null
      setBackgroundDrawable(GradientDrawable().apply {
        setColor(accent)
        cornerRadius = dp(context, 28f).toFloat()
      })
      setOnClickListener { onStart() }
    }, LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT, dp(context, 64f)
    ).apply { gravity = Gravity.CENTER })

    return root
  }
}
