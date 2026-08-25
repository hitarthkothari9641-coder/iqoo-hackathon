package com.collegeos.core.ui.theme

import androidx.compose.ui.graphics.Color

// ==============================================================================
// Editorial Campus Palette — Clean, Premium, Minimal, Academic, Modern, Human
// ==============================================================================

// Primary Institutional Tones (Default Branding)
val SlateBlue = Color(0xFF1E293B)       // Deep Academic Navy Primary
val SoftSteel = Color(0xFF475569)       // Secondary Slate
val MutedSlate = Color(0xFF64748B)      // Tertiary Slate

val WarmCreamLight = Color(0xFFF8FAFC)  // Clean Canvas Light Background
val SurfaceLight = Color(0xFFFFFFFF)    // Crisp Card Surface Light
val BorderLight = Color(0xFFE2E8F0)     // Subtle Border Light

// Dark Theme Variants
val DarkBackground = Color(0xFF0F172A)  // Deep Midnight Background
val DarkSurface = Color(0xFF1E293B)     // Surface Card Dark
val DarkBorder = Color(0xFF334155)      // Dark Border

// Configurable College Brand Overlay Tokens
data class CollegeBrandColors(
    val primary: Color = SlateBlue,
    val secondary: Color = SoftSteel,
    val accent: Color = Color(0xFF0EA5E9) // Accent Sky Blue
)
