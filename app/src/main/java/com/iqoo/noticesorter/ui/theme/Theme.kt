package com.iqoo.noticesorter.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BrandIndigo,
    secondary = BrandBlue,
    tertiary = BrandCyan,
    background = CanvasBackground,
    surface = SurfaceCard,
    surfaceVariant = SurfaceCardSecondary,
    onPrimary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    outline = BorderSubtle,
    outlineVariant = BorderActive
)

private val DarkColorScheme = darkColorScheme(
    primary = TextPrimaryDark,
    secondary = BrandBlue,
    tertiary = BrandCyan,
    background = CanvasBackgroundDark,
    surface = SurfaceCardDark,
    surfaceVariant = SurfaceCardSecondaryDark,
    onPrimary = CanvasBackgroundDark,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    outline = BorderSubtleDark,
    outlineVariant = TextSecondaryDark
)

val EditorialShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(14.dp),
    large = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun NoticeSorterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = (if (darkTheme) CanvasBackgroundDark else CanvasBackground).toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        shapes = EditorialShapes,
        content = content
    )
}
