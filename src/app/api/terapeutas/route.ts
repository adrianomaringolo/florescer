import { cadastrarTerapeuta } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";
import type { Publico } from "@/lib/dados";

export async function POST(req: Request) {
  const d = await corpo(req);
  return responder(
    await cadastrarTerapeuta({
      name: texto(d.name),
      email: texto(d.email),
      genero: texto(d.genero),
      publico: Array.isArray(d.publico) ? (d.publico as Publico[]) : [],
      disp: texto(d.disp),
      cap: Number(d.cap),
    }),
  );
}
