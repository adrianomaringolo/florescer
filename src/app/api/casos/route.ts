import { cadastrarCasoManual } from "@/server/acoes";
import { corpo, responder, texto } from "@/server/http";

export async function POST(req: Request) {
  const d = await corpo(req);
  return responder(
    await cadastrarCasoManual({
      nome: texto(d.nome),
      idade: texto(d.idade),
      publico: texto(d.publico),
      email: texto(d.email),
      telefone: texto(d.telefone),
      motivo: texto(d.motivo),
      disponibilidade: texto(d.disponibilidade),
      recebidoEm: texto(d.recebidoEm),
      situacao: texto(d.situacao),
      risco: d.risco === true,
      terapeutaId: texto(d.terapeutaId),
      desde: texto(d.desde),
      termoOk: d.termoOk === true,
      repasseOk: d.repasseOk === true,
      primeiroOk: d.primeiroOk === true,
      motivoDesligamento: texto(d.motivoDesligamento),
    }),
  );
}
