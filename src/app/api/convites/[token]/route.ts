import { NextResponse } from "next/server";
import { convitePorToken } from "@/server/acoes-publicas";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const convite = await convitePorToken(token);
  if (!convite) return NextResponse.json({ erro: "Convite inválido." }, { status: 404 });
  return NextResponse.json(convite);
}
