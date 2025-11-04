import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes that don't need auth
  const { pathname } = request.nextUrl
  
  // Allow public routes to pass through
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/api/upload']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/chat'))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, redirect to signin for protected routes
  if (!supabaseUrl || !supabaseAnonKey) {
    const protectedRoutes = ['/dashboard', '/solutions', '/chat', '/admin', '/profile', '/projects']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute) {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next()

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired - with timeout protection
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session check timeout')), 3000)
    )
    
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any

    // Protect routes that require authentication
    const protectedRoutes = ['/dashboard', '/solutions', '/chat', '/admin']
    const adminRoutes = ['/admin']
    
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    
    const isAdminRoute = adminRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !session) {
      // Redirect to sign in if not authenticated
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin access
    if (isAdminRoute && session) {
      // Get user metadata to check role
      const userRole = session.user.user_metadata?.role || 'client'
      
      if (userRole !== 'admin') {
        // Redirect non-admin users to dashboard page
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
  } catch (error) {
    // Log error but allow request to proceed
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
