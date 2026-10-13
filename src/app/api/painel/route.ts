import { NextResponse } from "next/server";
import { ERRO_TROCAR_SENHA } from "@/server/acoes";
import { usuarioAtual } from "@/server/auth";
import { carregarPainel } from "@/server/consultas";
import { naoAutorizado } from "@/server/http";

export const dynamic = "force-dynamic";

/** Sessão atual e todos os dados que o painel exibe. Com senha provisória, nenhum dado sai antes da troca. */
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return naoAutorizado();
  if (usuario.trocarSenha) return NextResponse.json({ ok: false, erro: ERRO_TROCAR_SENHA, trocarSenha: true }, { status: 403 });
  return NextResponse.json({ usuario, dados: await carregarPainel() });
}
