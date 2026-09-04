/**
 * Production-grade Cookie Utility
 * Provides high-security, client-safe cookie operations (SameSite, Secure, Expiry).
 */

import { COOKIE_KEYS, CookieKey } from '../enums/app.enum';

interface CookieOptions {
  days?: number;
  path?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Sets a cookie securely with production-grade defaults
 */
export function setCookie(
  key: CookieKey | string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    days = 7,
    path = '/',
    sameSite = 'Lax',
    secure = process.env.NODE_ENV === 'production' ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:'),
  } = options;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  const secureFlag = secure ? '; Secure' : '';

  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; ${expires}; path=${path}; SameSite=${sameSite}${secureFlag}`;
}

/**
 * Gets a cookie value by key
 */
export function getCookie(key: CookieKey | string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${encodeURIComponent(key)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * Removes a cookie by setting its expiration to the past
 */
export function removeCookie(key: CookieKey | string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Lax`;
}

/**
 * Checks whether a cookie exists
 */
export function hasCookie(key: CookieKey | string): boolean {
  return getCookie(key) !== null;
}

// Convenient helper specifically for access token
export const authCookies = {
  getToken: (): string | null => getCookie(COOKIE_KEYS.ACCESS_TOKEN),
  setToken: (token: string, days: number = 7): void =>
    setCookie(COOKIE_KEYS.ACCESS_TOKEN, token, { days }),
  clearToken: (): void => removeCookie(COOKIE_KEYS.ACCESS_TOKEN),
  hasToken: (): boolean => hasCookie(COOKIE_KEYS.ACCESS_TOKEN),
};
