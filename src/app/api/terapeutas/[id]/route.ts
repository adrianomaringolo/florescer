import { editarTerapeuta } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";
import type { Publico } from "@/lib/dados";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await corpo(req);
  return responder(
    await editarTerapeuta(id, {
      name: texto(d.name),
      email: texto(d.email),
      genero: texto(d.genero),
      publico: Array.isArray(d.publico) ? (d.publico as Publico[]) : [],
      disp: texto(d.disp),
      cap: Number(d.cap),
      active: d.active === true,
    }),
  );
}
