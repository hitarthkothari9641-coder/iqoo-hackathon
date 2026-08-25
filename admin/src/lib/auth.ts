export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  activeInstitutionId?: string;
}

export interface AdminAuthContext {
  user: AdminUser;
  roles: string[];
  permissions: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function loginAdmin(email: string, pass: string): Promise<{ token: string; context: AdminAuthContext }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Authentication failed');
  }

  const token = payload.data.tokens.accessToken;

  // Fetch full profile and authorization permissions
  const meResponse = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mePayload = await meResponse.json();

  if (!meResponse.ok || !mePayload.success) {
    throw new Error('Failed to retrieve authorization profile');
  }

  return {
    token,
    context: {
      user: mePayload.data.user,
      roles: mePayload.data.roles,
      permissions: mePayload.data.permissions,
    },
  };
}
