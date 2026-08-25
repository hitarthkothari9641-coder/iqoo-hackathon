package com.collegeos

import android.app.Application
import android.util.Log

class CollegeOsApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "College OS Application initialized. Version: 0.1.0 (Phase 1 Foundation)")
    }

    companion object {
        private const val TAG = "CollegeOsApplication"
    }
}
