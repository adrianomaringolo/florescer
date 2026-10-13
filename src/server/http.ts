import "server-only";

import { NextResponse } from "next/server";
import type { Resultado } from "./acoes";

/** Converte o Resultado de uma ação em resposta HTTP. */
export function responder(r: Resultado) {
  if (r.ok) return NextResponse.json(r);
  const status = r.erro.startsWith("Sua sessão expirou") ? 401 : 400;
  return NextResponse.json(r, { status });
}

export const naoAutorizado = () => NextResponse.json({ ok: false, erro: "Sua sessão expirou. Entre de novo." }, { status: 401 });

/** Lê o corpo JSON; devolve {} se vier vazio ou inválido (as ações validam os campos). */
export async function corpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const d = await req.json();
    return d && typeof d === "object" ? (d as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const texto = (v: unknown) => (typeof v === "string" ? v : "");
