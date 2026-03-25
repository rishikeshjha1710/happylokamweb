import { ROLE_COOKIE_KEY } from './auth-constants';
import { getGraphqlEndpoint } from './runtime-config';

export type SessionRole = 'USER' | 'PARTNER' | 'ADMIN';
const SESSION_COOKIE_MAX_AGE_SECONDS = 15 * 60;

export function normalizeSessionRole(role: string | null | undefined): SessionRole | null {
  if (!role) {
    return null;
  }

  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'VENDOR') {
    return 'PARTNER';
  }

  if (normalizedRole === 'USER' || normalizedRole === 'PARTNER' || normalizedRole === 'ADMIN') {
    return normalizedRole;
  }

  return null;
}

export function isSessionRole(role: string | null | undefined): role is SessionRole {
  return normalizeSessionRole(role) !== null;
}

function getCookie(name: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function getStoredToken() {
  return null;
}

export function persistSession(_token: string, role: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextRole = normalizeSessionRole(role);
  if (!nextRole) {
    return;
  }

  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ROLE_COOKIE_KEY}=${encodeURIComponent(nextRole)}; Path=/; SameSite=Lax; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}${secureAttribute}`;
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${ROLE_COOKIE_KEY}=; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getStoredRole() {
  return normalizeSessionRole(getCookie(ROLE_COOKIE_KEY));
}

export function getDashboardPathForRole(role: string | null | undefined) {
  const normalizedRole = normalizeSessionRole(role);

  if (!normalizedRole) {
    return '/login';
  }

  return normalizedRole === 'PARTNER' ? '/dashboard/partner' : `/dashboard/${normalizedRole.toLowerCase()}`;
}

export function readStoredSession() {
  return {
    token: null,
    role: getStoredRole()
  };
}

export async function logoutSession() {
  try {
    await fetch(getGraphqlEndpoint(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'mutation Logout { logout }'
      })
    });
  } finally {
    clearSession();
  }
}
