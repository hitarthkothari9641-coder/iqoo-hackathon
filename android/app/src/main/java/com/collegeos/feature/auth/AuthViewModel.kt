package com.collegeos.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.collegeos.core.network.ApiClient
import com.collegeos.core.network.ApiService
import com.collegeos.core.security.AndroidSecureStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val apiService: ApiService = ApiClient.createApiService(),
    private val secureStorage: AndroidSecureStorage? = null
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    fun checkExistingSession() {
        viewModelScope.launch {
            val token = secureStorage?.getAccessToken()
            if (token != null) {
                _authState.value = AuthState(status = AuthStatus.AUTHENTICATED)
            } else {
                _authState.value = AuthState(status = AuthStatus.UNAUTHENTICATED)
            }
        }
    }

    fun login(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _authState.value = AuthState(
                status = AuthStatus.UNAUTHENTICATED,
                errorMessage = "Please enter both email and password."
            )
            return
        }

        viewModelScope.launch {
            _authState.value = AuthState(status = AuthStatus.AUTHENTICATING)

            try {
                // In Phase 2, mock/real network login attempt
                if (email == "student@demo.collegeos.edu" && pass == "DevPassword123!") {
                    val user = AuthUser(
                        id = "00000000-0000-0000-0000-000000000002",
                        email = email,
                        firstName = "Aarav",
                        lastName = "Sharma",
                        displayName = "Aarav Sharma",
                        activeInstitutionId = "00000000-0000-0000-0000-000000000001"
                    )

                    secureStorage?.saveTokens("sample.access.token", "sample.refresh.token")
                    _authState.value = AuthState(
                        status = AuthStatus.AUTHENTICATED,
                        user = user
                    )
                } else {
                    _authState.value = AuthState(
                        status = AuthStatus.UNAUTHENTICATED,
                        errorMessage = "Invalid email or password."
                    )
                }
            } catch (e: Exception) {
                _authState.value = AuthState(
                    status = AuthStatus.UNAUTHENTICATED,
                    errorMessage = e.localizedMessage ?: "Authentication failed."
                )
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            secureStorage?.clear()
            _authState.value = AuthState(status = AuthStatus.UNAUTHENTICATED)
        }
    }
}
