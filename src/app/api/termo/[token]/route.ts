import { NextResponse } from "next/server";
import { aceitarTermo } from "@/server/acoes-publicas";
import { casoPorTokenDoTermo } from "@/server/consultas";
import { corpo, texto } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const caso = await casoPorTokenDoTermo(token);
  if (!caso) return NextResponse.json({ erro: "Link inválido." }, { status: 404 });
  return NextResponse.json(caso);
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await corpo(req);
  const r = await aceitarTermo(token, texto(d.nome), texto(d.menor) || undefined);
  return NextResponse.json(r, { status: r.erro ? 400 : 200 });
}
