package com.collegeos.core.network

import com.google.gson.annotations.SerializedName

/**
 * Standard API Success & Meta Wrapper Contract matching Backend
 */
data class ApiResponseWrapper<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("error") val error: ApiErrorPayload?,
    @SerializedName("meta") val meta: ApiMetaPayload?
)

data class ApiErrorPayload(
    @SerializedName("code") val code: String,
    @SerializedName("message") val message: String,
    @SerializedName("details") val details: Any? = null
)

data class ApiMetaPayload(
    @SerializedName("requestId") val requestId: String?,
    @SerializedName("timestamp") val timestamp: String?
)

sealed class NetworkResult<out T> {
    data class Success<out T>(val data: T, val requestId: String? = null) : NetworkResult<T>()
    data class Error(val code: String, val message: String, val requestId: String? = null) : NetworkResult<Nothing>()
    data class Exception(val throwable: Throwable) : NetworkResult<Nothing>()
}

class NetworkException(
    override val message: String,
    val code: String = "NETWORK_ERROR",
    val causeException: Throwable? = null
) : Exception(message, causeException)
