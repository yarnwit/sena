import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
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

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // This refreshes the session if expired — required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // 1. ถ้ายังไม่ Login และเข้าหน้าอื่นที่ไม่ใช่ Auth ให้ redirect ไป Login
  if (!user && !currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. ถ้า Login แล้ว ให้ตรวจสอบ Role ตาม Path
  if (user) {
    // ดึง Role ของ User จาก Database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userData?.role || 'resident';

    // เช็คสิทธิ์การเข้าถึง
    if (currentPath.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'staff' ? '/staff/dashboard' : '/resident/dashboard';
      return NextResponse.redirect(url);
    }

    if (currentPath.startsWith('/staff') && role !== 'staff' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/resident/dashboard';
      return NextResponse.redirect(url);
    }
    
    // ถ้า Login แล้วแต่พยายามเข้าหน้า Login หรือ Register ให้ส่งกลับไปหน้า Dashboard ของตัวเอง
    if (currentPath === '/login' || currentPath === '/register') {
      const url = request.nextUrl.clone();
      if (role === 'admin') url.pathname = '/admin/dashboard';
      else if (role === 'staff') url.pathname = '/staff/dashboard';
      else url.pathname = '/resident/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
