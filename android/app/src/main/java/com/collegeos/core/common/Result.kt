package com.collegeos.core.common

sealed class AppResult<out T> {
    data class Success<out T>(val data: T) : AppResult<T>()
    data class Error(val exception: Throwable, val message: String? = exception.localizedMessage) : AppResult<Nothing>()
    object Loading : AppResult<Nothing>()
}

object Constants {
    const val APP_NAME = "COLLEGE OS"
    const val APP_TAGLINE = "Your college. Your community. Your future."
    const val APP_VERSION = "1.0.0"
    const val PHASE_STAGE = "Production Platform Active"
}
