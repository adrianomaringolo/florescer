import { cadastrarUsuario } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  return responder(await cadastrarUsuario({ name: texto(d.name), email: texto(d.email), senha: typeof d.senha === "string" ? d.senha : undefined }));
}
