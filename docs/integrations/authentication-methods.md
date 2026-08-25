# 🔐 Approved ERP Connection Methods

Supported authentication types:
1. `API_KEY`: Official institution API tokens.
2. `OAUTH2`: Authorization Code flow with PKCE for institutional OAuth2 portals.
3. `OIDC`: OpenID Connect identity assertion with JWKS validation.
4. `SAML`: SAML 2.0 Web SSO for institutional single sign-on.
5. `SERVICE_ACCOUNT`: Dedicated institution service account credentials.
6. `WEBHOOK`: HMAC-signed real-time event webhooks.
7. `FILE_IMPORT`: Schema-validated CSV, Excel, or JSON data exports.
8. `MANUAL_IMPORT`: Default fallback for unsupported portals.
