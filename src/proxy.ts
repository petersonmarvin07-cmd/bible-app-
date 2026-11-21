import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "lumen_session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isDemoAuthEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEMO_AUTH === "true";

  if (!token && !isDemoAuthEnabled) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (nextPath && nextPath !== "/dashboard") {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/read/:path*",
    "/journal/:path*",
    "/collections/:path*",
    "/plans/:path*",
    "/prayer/:path*",
    "/wonders/:path*",
    "/family/:path*",
    "/faithprint/:path*",
    "/trainer/:path*",
  ],
};
