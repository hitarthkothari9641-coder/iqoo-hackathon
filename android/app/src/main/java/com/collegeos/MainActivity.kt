package com.collegeos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.collegeos.core.ui.CollegeOsSplash
import com.collegeos.core.ui.MainAppScreen
import com.collegeos.core.ui.theme.CollegeOsTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            CollegeOsTheme {
                var showSplash by remember { mutableStateOf(true) }

                if (showSplash) {
                    CollegeOsSplash(
                        onSplashFinished = { showSplash = false }
                    )
                } else {
                    MainAppScreen()
                }
            }
        }
    }
}
