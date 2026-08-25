package com.iqoo.noticesorter

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.core.content.IntentCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.iqoo.noticesorter.data.RealNoticeProcessor
import com.iqoo.noticesorter.ui.screens.CampusVerseApp
import com.iqoo.noticesorter.ui.screens.SplashScreen
import com.iqoo.noticesorter.ui.theme.NoticeSorterTheme

class MainActivity : ComponentActivity() {

    // Reactive Compose state for incoming shared document URI
    private var sharedUriState by mutableStateOf<String?>(null)
    private val processor by lazy { RealNoticeProcessor() }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Handle initial intent when activity is launched
        sharedUriState = handleIncomingShareIntent(intent)

        setContent {
            NoticeSorterTheme {
                var showSplash by remember { mutableStateOf(sharedUriState == null) }

                if (showSplash) {
                    SplashScreen(
                        onSplashFinished = { showSplash = false }
                    )
                } else {
                    CampusVerseApp(
                        sharedImageUri = sharedUriState,
                        noticeProcessor = processor
                    )
                }
            }
        }
    }

    // Handle new incoming share intents when activity is already in foreground/background (singleTop)
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        sharedUriState = handleIncomingShareIntent(intent)
    }

    private fun handleIncomingShareIntent(intent: Intent?): String? {
        if (intent == null) return null

        return try {
            val action = intent.action
            val type = intent.type

            when {
                // Single document or image shared
                Intent.ACTION_SEND == action && type != null -> {
                    if (type.startsWith("image/") || type == "application/pdf") {
                        val uri = IntentCompat.getParcelableExtra(intent, Intent.EXTRA_STREAM, Uri::class.java)
                        uri?.toString()
                    } else null
                }
                // Multiple items shared (picks the first item for MVP)
                Intent.ACTION_SEND_MULTIPLE == action && type != null -> {
                    if (type.startsWith("image/")) {
                        val uris = IntentCompat.getParcelableArrayListExtra(intent, Intent.EXTRA_STREAM, Uri::class.java)
                        uris?.firstOrNull()?.toString()
                    } else null
                }
                else -> null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

