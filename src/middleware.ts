import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public asset or auth endpoint
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  // Helper to ensure refreshed auth cookies are preserved across redirects
  const createRedirect = (targetUrl: URL) => {
    const redirectRes = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  };

  // Not logged in
  if (!user) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/learner')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return createRedirect(url);
    }
    return supabaseResponse;
  }

  // If logged in, fetch user profile role for routing protection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  // If account is inactive
  if (profile && !profile.is_active && pathname !== '/inactive') {
    const url = request.nextUrl.clone();
    url.pathname = '/inactive';
    return createRedirect(url);
  }

  // Strict Role Isolation:
  // 1. Protect Admin routes from learners (Learner can NEVER access /admin)
  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/learner';
      return createRedirect(url);
    }
  }

  // 2. Protect Learner routes from admins (Admin can NEVER access /learner)
  if (pathname.startsWith('/learner')) {
    if (profile?.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return createRedirect(url);
    }
  }

  // Redirect from login or root when already authenticated
  if (pathname === '/login' || pathname === '/') {
    const url = request.nextUrl.clone();
    url.search = ''; // Strip any lingering search params like redirectTo
    if (profile?.role === 'admin') {
      url.pathname = '/admin';
    } else {
      url.pathname = '/learner';
    }
    return createRedirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

