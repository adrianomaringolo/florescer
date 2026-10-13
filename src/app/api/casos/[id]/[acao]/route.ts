import { NextResponse } from "next/server";
import * as acoes from "@/server/acoes";
import { usuarioAtual } from "@/server/auth";
import { corpo, naoAutorizado, responder, texto } from "@/server/http";
import { auditar } from "@/server/registro";

type Params = { params: Promise<{ id: string; acao: string }> };

const MARCACOES: acoes.Marcacao[] = ["termoOk", "repasseOk", "primeiroOk"];

/** Ações sobre um caso: POST /api/casos/:id/:acao */
export async function POST(req: Request, { params }: Params) {
  const { id, acao } = await params;
  const d = await corpo(req);

  switch (acao) {
    case "visualizacao": {
      // 5.2: todo acesso a dados de pacientes fica registrado.
      const u = await usuarioAtual();
      if (!u) return naoAutorizado();
      await auditar(u.id, "caso_visualizado", id);
      return NextResponse.json({ ok: true });
    }
    case "boas-vindas":
      return responder(await acoes.enviarBoasVindas(id, texto(d.assunto), texto(d.corpo)));
    case "concluir-acolhimento":
      return responder(await acoes.concluirAcolhimento(id));
    case "sair-de-pendente":
      return responder(await acoes.sairDePendente(id));
    case "encaminhar":
      return responder(await acoes.encaminhar(id, texto(d.terapeutaId)));
    case "marcacao": {
      const campo = MARCACOES.find((m) => m === d.campo);
      if (!campo || typeof d.valor !== "boolean") return NextResponse.json({ ok: false, erro: "Marcação inválida." }, { status: 400 });
      return responder(await acoes.marcar(id, campo, d.valor));
    }
    case "retorno":
      return responder(await acoes.retornarParaEscolha(id, texto(d.motivo), texto(d.observacao)));
    case "desligamento":
      return responder(await acoes.desligar(id, texto(d.motivo)));
    case "lembrete":
      return responder(await acoes.enviarLembrete(id));
    case "reenviar-ficha":
      return responder(await acoes.reenviarFicha(id));
    default:
      return NextResponse.json({ ok: false, erro: "Ação desconhecida." }, { status: 404 });
  }
}
