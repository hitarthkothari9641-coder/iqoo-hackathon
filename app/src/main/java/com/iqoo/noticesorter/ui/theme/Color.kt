package com.iqoo.noticesorter.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Core College OS Editorial Campus Palette
val BrandIndigo = Color(0xFF1E293B)      // Deep Editorial Navy/Slate
val BrandIndigoDark = Color(0xFF0F172A)
val BrandIndigoLight = Color(0xFF334155)
val BrandBlue = Color(0xFF2563EB)
val BrandCyan = Color(0xFF0891B2)
val BrandTeal = Color(0xFF0D9488)
val BrandViolet = Color(0xFF7C3AED)
val BrandPink = Color(0xFFDB2777)

// Neutral Canvas & Surface Tones (Editorial Light & Dark)
val CanvasBackground = Color(0xFFF7F7F5)
val CanvasBackgroundDark = Color(0xFF0B0B0B)
val SurfaceCard = Color(0xFFFFFFFF)
val SurfaceCardDark = Color(0xFF151515)
val SurfaceCardSecondary = Color(0xFFF0F0EE)
val SurfaceCardSecondaryDark = Color(0xFF1D1D1D)
val SurfaceCardMuted = Color(0xFFE5E5E3)
val BorderSubtle = Color(0xFFE5E5E3)
val BorderSubtleDark = Color(0xFF262626)
val BorderActive = Color(0xFF111111)

// Typography Neutral Tones
val TextPrimary = Color(0xFF111111)     // High-contrast Editorial Black
val TextPrimaryDark = Color(0xFFF5F5F5)
val TextSecondary = Color(0xFF6B6B6B)   // Editorial Charcoal
val TextSecondaryDark = Color(0xFFA0A0A0)
val TextMuted = Color(0xFF999999)       // Editorial Muted
val TextOnBrand = Color(0xFFFFFFFF)

// Functional Category & Status Accent Colors
val ExamAmber = Color(0xFFD97706)
val ExamAmberBg = Color(0xFFFEF3C7)
val FeeEmerald = Color(0xFF059669)
val FeeEmeraldBg = Color(0xFFD1FAE5)
val EventPurple = Color(0xFF7C3AED)
val EventPurpleBg = Color(0xFFEDE9FE)
val CircularBlue = Color(0xFF0284C7)
val CircularBlueBg = Color(0xFFE0F2FE)
val CareerCyan = Color(0xFF0891B2)
val CareerCyanBg = Color(0xFFCFFAFE)
val SocialPink = Color(0xFFDB2777)
val SocialPinkBg = Color(0xFFFCE7F3)
val AiSparkleViolet = Color(0xFF7C3AED)
val OtherSlate = Color(0xFF475569)
val OtherSlateBg = Color(0xFFF1F5F9)

// High-tech Gradients
val PrimaryHeroGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF4338CA), Color(0xFF3B82F6), Color(0xFF06B6D4))
)

val ActionButtonGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF2563EB), Color(0xFF4F46E5))
)

val AiGlowGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF8B5CF6), Color(0xFFEC4899), Color(0xFF3B82F6))
)

val PlacementHeroGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF312E81))
)

val AttendanceGoodGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF10B981), Color(0xFF059669))
)

val AttendanceWarningGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706))
)

val AttendanceDangerGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFFEF4444), Color(0xFFDC2626))
)

val CardGlowGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFFF8FAFC), Color(0xFFFFFFFF))
)

val AmberWarningGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706))
)

val EmeraldSuccessGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF10B981), Color(0xFF059669))
)

// Legacy alias compatibility
val PaletteSlateBlue = BrandIndigo
val PaletteSoftSteel = TextMuted
val PaletteCream = CanvasBackground
val PaletteSageGreen = FeeEmeraldBg
val PaletteMossGreen = FeeEmerald
val PaletteDarkText = TextPrimary
val PaletteSubtext = TextSecondary
val PaletteCardBackground = SurfaceCard
val PaletteCardBorder = BorderSubtle
val PositivePrimaryGradient = PrimaryHeroGradient
val PositiveButtonGradient = ActionButtonGradient

