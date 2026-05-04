import { NextResponse } from 'next/server';

/**
 * Next.js Middleware: Protects ALL /admin/* routes except the login page (/admin).
 * Checks for rms_token cookie containing valid JWT.
 * Unauthenticated users are redirected to /admin (login page).
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect ALL admin sub-routes (dashboard, orders, inventory, payments, etc.)
    // The login page at exactly /admin is excluded from protection
    if (pathname.startsWith('/admin/')) {
        const token = request.cookies.get('rms_token')?.value;

        if (!token) {
            const loginUrl = new URL('/admin', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Token exists — verify it's not expired (basic JWT decode)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < now) {
                const loginUrl = new URL('/admin', request.url);
                const response = NextResponse.redirect(loginUrl);
                response.cookies.delete('rms_token');
                return response;
            }
        } catch (e) {
            const loginUrl = new URL('/admin', request.url);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('rms_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path+'],
};
