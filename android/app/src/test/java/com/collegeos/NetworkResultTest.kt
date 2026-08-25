package com.collegeos

import com.collegeos.core.network.NetworkResult
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NetworkResultTest {

    @Test
    fun `NetworkResult Success contains correct data and requestId`() {
        val result = NetworkResult.Success(data = "OK", requestId = "req-123")
        assertTrue(result is NetworkResult.Success)
        assertEquals("OK", result.data)
        assertEquals("req-123", result.requestId)
    }

    @Test
    fun `NetworkResult Error holds error code and message`() {
        val result = NetworkResult.Error(code = "UNAUTHORIZED", message = "Access denied", requestId = "req-456")
        assertTrue(result is NetworkResult.Error)
        assertEquals("UNAUTHORIZED", result.code)
        assertEquals("Access denied", result.message)
        assertEquals("req-456", result.requestId)
    }
}
