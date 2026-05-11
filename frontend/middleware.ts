import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // อ่าน accessToken และ user จาก cookie
  const accessToken = request.cookies.get("accessToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  let user: { id: string; role: string } | null = null;

  if (accessToken && userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      user = null;
    }
  }

  // หน้าที่ไม่ต้อง Login (Auth pages)
  const isAuthPage =
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/register") ||
    currentPath.startsWith("/forgot-password");

  // 1. ถ้ายังไม่ Login และเข้าหน้าที่ไม่ใช่ Auth → redirect ไป Login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. ถ้า Login แล้ว → ตรวจสอบ Role ตาม Path
  if (user) {
    const role = user.role || "resident";

    // เช็คสิทธิ์การเข้าถึง Admin
    if (currentPath.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname =
        role === "staff" ? "/staff/dashboard" : "/resident/dashboard";
      return NextResponse.redirect(url);
    }

    // เช็คสิทธิ์การเข้าถึง Staff
    if (
      currentPath.startsWith("/staff") &&
      role !== "staff" &&
      role !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/resident/dashboard";
      return NextResponse.redirect(url);
    }

    // ถ้า Login แล้วแต่พยายามเข้าหน้า Login/Register → redirect ไป Dashboard
    if (
      currentPath === "/login" ||
      currentPath === "/register" ||
      currentPath === "/"
    ) {
      const url = request.nextUrl.clone();
      if (role === "admin") url.pathname = "/admin/dashboard";
      else if (role === "staff") url.pathname = "/staff/dashboard";
      else url.pathname = "/resident/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
