import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "snel-cvs-kitambo-secret-key-2024"
);

const ROLE_PATH: Record<string, string> = {
  superadmin: "/dashboard/super",
  administrateur: "/dashboard/admin",
  cd: "/dashboard/cd",
  get: "/dashboard/get",
  abonne: "/dashboard/abonne",
};

async function getRoleFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const role = await getRoleFromToken(token);
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const expectedPath = ROLE_PATH[role];
    if (expectedPath && !pathname.startsWith(expectedPath)) {
      return NextResponse.redirect(new URL(expectedPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
