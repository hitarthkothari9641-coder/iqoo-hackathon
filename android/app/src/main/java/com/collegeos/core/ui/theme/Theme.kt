package com.collegeos.core.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = SlateBlue,
    onPrimary = SurfaceLight,
    secondary = SoftSteel,
    onSecondary = SurfaceLight,
    tertiary = MutedSlate,
    background = WarmCreamLight,
    surface = SurfaceLight,
    onBackground = SlateBlue,
    onSurface = SlateBlue,
    outline = BorderLight
)

private val DarkColorScheme = darkColorScheme(
    primary = SoftSteel,
    onPrimary = DarkBackground,
    secondary = MutedSlate,
    onSecondary = DarkBackground,
    background = DarkBackground,
    surface = DarkSurface,
    onBackground = SurfaceLight,
    onSurface = SurfaceLight,
    outline = DarkBorder
)

@Composable
fun CollegeOsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    brandColors: CollegeBrandColors? = null,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val baseScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val colorScheme = if (brandColors != null) {
        baseScheme.copy(
            primary = brandColors.primary,
            secondary = brandColors.secondary,
            tertiary = brandColors.accent
        )
    } else {
        baseScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = EditorialTypography,
        shapes = CollegeOsShapes,
        content = content
    )
}
