import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Since we're using localStorage for tokens (client-side),
// we rely on client-side guards in each protected page.
// Middleware can't access localStorage, so we keep this minimal.
export function proxy(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
  ],
};
