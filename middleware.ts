import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  const { pathname } = request.nextUrl
  
  // Allow public routes to pass through
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/api/upload']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/chat'))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, just pass through - auth is handled client-side
  // This avoids edge runtime issues with Supabase
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

