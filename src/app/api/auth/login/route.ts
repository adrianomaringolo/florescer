import { NextResponse } from "next/server";
import { entrar } from "@/server/acoes-publicas";
import { corpo, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  const r = await entrar({ email: texto(d.email), senha: texto(d.senha) });
  return NextResponse.json(r, { status: r.erro ? 401 : 200 });
}
