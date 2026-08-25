package com.collegeos.core.security

import android.content.Context
import android.content.SharedPreferences

class AndroidSecureStorage(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)

    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    fun saveActiveInstitutionId(institutionId: String) {
        prefs.edit().putString(KEY_INSTITUTION_ID, institutionId).apply()
    }

    fun getActiveInstitutionId(): String? = prefs.getString(KEY_INSTITUTION_ID, null)

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREF_NAME = "collegeos_secure_prefs"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_INSTITUTION_ID = "active_institution_id"
    }
}
