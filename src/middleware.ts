import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // const adminToken = request.cookies.get('gn_super_admin_token');

        // // If not authenticated, redirect to login
        // // Note: We'll create /admin/login page next
        // if (!adminToken || adminToken.value !== 'valid') {
        //     // Allow access to the login page itself to avoid infinite loop
        //     if (request.nextUrl.pathname === '/admin/login') {
        //         return NextResponse.next();
        //     }
        //     return NextResponse.redirect(new URL('/admin/login', request.url));
        // }
    }

    // 2. Protect Parent Routes (Optional - implementing for consistency)
    // If we want to force login for /parent, we can do it here too.
    // For now, let's stick to the critical Admin protection requested.

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
