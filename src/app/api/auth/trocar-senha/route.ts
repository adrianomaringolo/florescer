import { trocarSenha } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  return responder(await trocarSenha({ atual: texto(d.atual), nova: texto(d.nova), confirmacao: texto(d.confirmacao) }));
}
