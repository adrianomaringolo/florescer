import { NextResponse, type NextRequest } from "next/server";

// Checagem rápida de presença do cookie; a validação real da sessão acontece no
// servidor (usuarioAtual) em cada endpoint. Os endpoints /api autenticam por conta própria
// e respondem 401 em JSON, em vez de redirecionar.
const PUBLICAS = ["/login", "/solicitar", "/convite/", "/termo/", "/api/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLICAS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.has("florescer_sessao")) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|icon.svg|brand/|favicon).*)"],
};
