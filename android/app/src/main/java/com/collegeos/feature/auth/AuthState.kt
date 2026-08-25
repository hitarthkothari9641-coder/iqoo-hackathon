package com.collegeos.feature.auth

enum class AuthStatus {
    UNKNOWN,
    AUTHENTICATING,
    AUTHENTICATED,
    MFA_REQUIRED,
    UNAUTHENTICATED,
    SESSION_EXPIRED,
    LOCKED
}

data class AuthUser(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val displayName: String?,
    val activeInstitutionId: String?
)

data class AuthState(
    val status: AuthStatus = AuthStatus.UNKNOWN,
    val user: AuthUser? = null,
    val errorMessage: String? = null,
    val isMfaRequired: Boolean = false
)
