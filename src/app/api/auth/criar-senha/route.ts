import { NextResponse } from "next/server";
import { criarSenha } from "@/server/acoes-publicas";
import { corpo, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  const r = await criarSenha({ token: texto(d.token), senha: texto(d.senha), confirmacao: texto(d.confirmacao) });
  return NextResponse.json(r, { status: r.erro ? 400 : 200 });
}
