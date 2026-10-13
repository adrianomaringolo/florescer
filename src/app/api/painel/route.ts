import { NextResponse } from "next/server";
import { usuarioAtual } from "@/server/auth";
import { carregarPainel } from "@/server/consultas";
import { naoAutorizado } from "@/server/http";

export const dynamic = "force-dynamic";

/** Sessão atual e todos os dados que o painel exibe. */
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return naoAutorizado();
  return NextResponse.json({ usuario, dados: await carregarPainel() });
}
