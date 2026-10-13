import { convidarUsuario } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  return responder(await convidarUsuario({ name: texto(d.name), email: texto(d.email) }));
}
