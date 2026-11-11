import { NextResponse, type NextRequest } from "next/server";

function isMaintenanceEnabled() {
  return process.env.MAINTENANCE_MODE?.trim().toLowerCase() === "true";
}

export function proxy(request: NextRequest) {
  if (!isMaintenanceEnabled() || request.nextUrl.pathname === "/manutencao") {
    return NextResponse.next();
  }

  const response = NextResponse.rewrite(new URL("/manutencao", request.url), {
    status: 503,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Retry-After", "3600");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
