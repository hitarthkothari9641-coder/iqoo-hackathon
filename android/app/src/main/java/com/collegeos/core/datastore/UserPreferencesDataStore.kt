package com.collegeos.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "collegeos_user_prefs")

class UserPreferencesDataStore(private val context: Context) {

    private val KEY_INSTITUTION_ID = stringPreferencesKey("institution_id")
    private val KEY_THEME_MODE = stringPreferencesKey("theme_mode")

    val institutionIdFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_INSTITUTION_ID]
    }

    val themeModeFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_THEME_MODE] ?: "system"
    }

    suspend fun setInstitutionId(institutionId: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_INSTITUTION_ID] = institutionId
        }
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_THEME_MODE] = mode
        }
    }

    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
