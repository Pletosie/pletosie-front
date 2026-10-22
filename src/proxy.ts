import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  if (
    [
      "/admin",
      "/compte",
      "/commande",
      "/commandes",
      "/conversations",
      "/panier",
      "/paiement",
      "/offre",
    ].some((p) => path === p || path.startsWith(p + "/"))
  )
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
