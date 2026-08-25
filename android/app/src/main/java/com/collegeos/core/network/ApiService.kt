package com.collegeos.core.network

import retrofit2.Response
import retrofit2.http.GET

data class HealthData(
    val status: String,
    val service: String,
    val version: String,
    val environment: String,
    val timestamp: String?
)

data class ReadinessData(
    val status: String,
    val checks: Map<String, String>,
    val timestamp: String?
)

interface ApiService {
    @GET("health")
    suspend fun getHealth(): Response<ApiResponseWrapper<HealthData>>

    @GET("health/ready")
    suspend fun getReadiness(): Response<ApiResponseWrapper<ReadinessData>>
}
