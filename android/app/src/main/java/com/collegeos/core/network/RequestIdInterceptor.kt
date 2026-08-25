package com.collegeos.core.network

import okhttp3.Interceptor
import okhttp3.Response
import java.util.UUID

class RequestIdInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val requestId = originalRequest.header("X-Request-Id") ?: UUID.randomUUID().toString()

        val requestWithHeaders = originalRequest.newBuilder()
            .header("X-Request-Id", requestId)
            .header("Accept", "application/json")
            .build()

        return chain.proceed(requestWithHeaders)
    }
}

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenProvider()

        val builder = originalRequest.newBuilder()
        if (!token.isNull_or_blank() && originalRequest.header("Authorization") == null) {
            builder.header("Authorization", "Bearer $token")
        }

        return chain.proceed(builder.build())
    }

    private fun String?.isNull_or_blank(): Boolean = this == null || this.trim().isEmpty()
}
