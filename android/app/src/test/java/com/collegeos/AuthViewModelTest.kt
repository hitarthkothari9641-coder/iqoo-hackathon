package com.collegeos

import com.collegeos.feature.auth.AuthState
import com.collegeos.feature.auth.AuthStatus
import com.collegeos.feature.auth.AuthViewModel
import org.junit.Assert.assertEquals
import org.junit.Test

class AuthViewModelTest {

    @Test
    fun `initial AuthState has UNKNOWN status`() {
        val viewModel = AuthViewModel()
        assertEquals(AuthStatus.UNKNOWN, viewModel.authState.value.status)
    }

    @Test
    fun `empty credentials produce error in state`() {
        val viewModel = AuthViewModel()
        viewModel.login("", "")
        assertEquals(AuthStatus.UNAUTHENTICATED, viewModel.authState.value.status)
        assertEquals("Please enter both email and password.", viewModel.authState.value.errorMessage)
    }
}
