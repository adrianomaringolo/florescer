import { redefinirSenha } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await corpo(req);
  return responder(await redefinirSenha(id, texto(d.senha)));
}
