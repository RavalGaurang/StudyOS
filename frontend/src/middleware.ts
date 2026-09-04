import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_ROUTES, COOKIE_KEYS, USER_ROLES } from './enums/app.enum';

interface JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
}

/**
 * Decodes a JWT payload in the Edge runtime without external dependencies.
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks whether an access token is structurally valid and unexpired.
 */
function isTokenValid(token?: string): { valid: boolean; payload?: JwtPayload } {
  if (!token) return { valid: false };
  const payload = parseJwtPayload(token);
  if (!payload) return { valid: false };

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return { valid: false, payload };
  }

  return { valid: true, payload };
}

const PUBLIC_AUTH_ROUTES = [
  APP_ROUTES.LOGIN,
  APP_ROUTES.REGISTER,
  APP_ROUTES.FORGOT_PASSWORD,
];

function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Next.js Edge Middleware
 * 1. If token not found on protected routes -> instantly redirect to /login.
 * 2. If user first time arrival on web -> show Home (/) page.
 * 3. If authenticated user visits auth/home routes -> redirect to their role dashboard.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawToken = request.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const hasVisited = request.cookies.get(COOKIE_KEYS.VISITED)?.value;
  const { valid: isAuthenticated, payload } = isTokenValid(rawToken);

  const isHomeRoute = pathname === APP_ROUTES.HOME;
  const isFirstVisit = !hasVisited;

  // 1. FIRST-TIME ARRIVAL HANDLING:
  // If user arrives on web for the first time without an active session:
  if (isFirstVisit && !isAuthenticated) {
    // If they land on the Home (/) page:
    if (isHomeRoute) {
      const response = NextResponse.next();
      response.cookies.set(COOKIE_KEYS.VISITED, 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
      return response;
    }

    // If they intentionally visit a public auth route (login/register/forgot-password):
    if (isPublicAuthRoute(pathname)) {
      const response = NextResponse.next();
      response.cookies.set(COOKIE_KEYS.VISITED, 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
      return response;
    }

    // If first-time arrival enters via any protected route without a token, show Home (/) page:
    const homeUrl = new URL(APP_ROUTES.HOME, request.url);
    const response = NextResponse.redirect(homeUrl);
    response.cookies.set(COOKIE_KEYS.VISITED, 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  }

  // 2. UNAUTHENTICATED USERS (TOKEN NOT FOUND):
  if (!isAuthenticated) {
    // Home page (/) is public:
    if (isHomeRoute) {
      return NextResponse.next();
    }

    // Auth pages (/login, /register, /forgot-password) are public:
    if (isPublicAuthRoute(pathname)) {
      return NextResponse.next();
    }

    // Protected route accessed without token -> INSTANTLY redirect to login page:
    const loginUrl = new URL(APP_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);

    const response = NextResponse.redirect(loginUrl);
    // If an invalid or expired token was present, clear it from cookies
    if (rawToken) {
      response.cookies.delete(COOKIE_KEYS.ACCESS_TOKEN);
    }
    return response;
  }

  // 3. AUTHENTICATED USERS (TOKEN FOUND):
  const userRole = payload?.role;
  let targetDashboard: string = APP_ROUTES.DASHBOARD;
  if (userRole === USER_ROLES.PARENT) {
    targetDashboard = APP_ROUTES.PARENT_DASHBOARD;
  } else if (userRole === USER_ROLES.ADMIN) {
    targetDashboard = APP_ROUTES.ADMIN_DASHBOARD;
  }

  // Redirect authenticated users away from public auth pages or the marketing landing page:
  if (isHomeRoute || isPublicAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Role-based route authorization guards:
  if (pathname.startsWith('/admin') && userRole !== USER_ROLES.ADMIN) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  if (pathname.startsWith('/parent') && userRole !== USER_ROLES.PARENT) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png
     * - images directory
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|images|site.webmanifest).*)',
  ],
};
