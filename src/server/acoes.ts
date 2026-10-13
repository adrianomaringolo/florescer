import "server-only";

import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  LINK_TERMO,
  MOTIVOS_DESLIGAMENTO,
  camposFicha,
  MOTIVOS_RETORNO,
  ORIENTACOES_TERAPEUTA,
  primeiroNome,
  GENEROS_TERAPEUTA,
  type Publico,
} from "@/lib/dados";
import { diasUteis, emailValido } from "@/lib/regras";
import { novoToken, usuarioAtual, type UsuarioLogado } from "./auth";
import { diasDesde } from "./datas";
import { auditar, enviarEmail, urlBase } from "./registro";

// Todas as escritas do painel (chamadas pelos endpoints em /api). Cada ação revalida a sessão e as regras de
// transição de status no servidor — a interface só esconde o que não se aplica.

export type Resultado = { ok: true; mensagem?: string; link?: string } | { ok: false; erro: string };

const falha = (erro: string): Resultado => ({ ok: false, erro });

async function comUsuario(f: (u: UsuarioLogado) => Promise<Resultado>): Promise<Resultado> {
  const u = await usuarioAtual();
  if (!u) return falha("Sua sessão expirou. Entre de novo.");
  return f(u);
}

type LinhaCaso = typeof schema.casos.$inferSelect;

async function buscarCaso(id: string) {
  const [c] = await db.select().from(schema.casos).where(eq(schema.casos.id, id));
  return c;
}

async function buscarTerapeuta(id: string | null) {
  if (!id) return undefined;
  const [t] = await db.select().from(schema.terapeutas).where(eq(schema.terapeutas.id, id));
  return t;
}

const linkTermo = (c: LinhaCaso) => `${urlBase()}/termo/${c.termoToken}`;
const mudarStatus = (status: LinhaCaso["status"]) => ({ status, statusDesde: new Date() });

function textoFicha(c: LinhaCaso) {
  const v = (x: string | number | null | undefined) => (x === null || x === undefined || x === "" ? "Não informado" : String(x));
  return [
    `Nome: ${v(c.nome)}`,
    `Idade: ${v(c.idade)}`,
    `E-mail: ${v(c.email)}`,
    `Telefone: ${v(c.telefone)}`,
    `Motivo: ${v(c.motivo)}`,
    `Disponibilidade: ${v(c.disponibilidade)}`,
    `Público: ${v(c.publico)}`,
    // Documento e endereço ficam só com a equipe.
    ...(c.ficha ? camposFicha(c.ficha).filter((f) => f.paraTerapeuta).map((f) => `${f.rotulo}: ${v(f.valor)}`) : []),
  ].join("\n");
}

const textoOrientacao = () =>
  `Termo de orientação ao terapeuta\n${ORIENTACOES_TERAPEUTA.map((o, i) => `${i + 1}. ${o}`).join("\n")}`;

// --- Acolhimento (2.1) --------------------------------------------------------

export async function enviarBoasVindas(casoId: string, assunto: string, corpo: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status !== "acolhimento") return falha("As boas-vindas só são enviadas durante o acolhimento.");
    if (!corpo.includes(LINK_TERMO)) return falha(`O link ${LINK_TERMO} não pode ser removido do e-mail.`);
    if (!assunto.trim()) return falha("O assunto não pode ficar vazio.");
    if (!emailValido(c.email)) return falha("Este caso não tem e-mail válido.");

    await enviarEmail({ para: c.email, assunto: assunto.trim(), corpo: corpo.replace(LINK_TERMO, linkTermo(c)), casoId });
    await db.update(schema.casos).set({ boasVindasEm: new Date() }).where(eq(schema.casos.id, casoId));
    await auditar(u.id, "boas_vindas_enviadas", casoId);
    return { ok: true, mensagem: `Boas-vindas enviadas a ${c.nome}.` };
  });
}

export async function concluirAcolhimento(casoId: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status !== "acolhimento") return falha("Este caso não está em acolhimento.");
    await db.update(schema.casos).set(mudarStatus("escolha")).where(eq(schema.casos.id, casoId));
    await auditar(u.id, "acolhimento_concluido", casoId);
    return { ok: true, mensagem: `${c.nome} seguiu para a escolha de terapeuta.` };
  });
}

// --- Pendente (2.5) -----------------------------------------------------------

export async function sairDePendente(casoId: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status !== "pendente") return falha("Este caso não está pendente.");
    await db.update(schema.casos).set({ ...mudarStatus("acolhimento"), risco: false }).where(eq(schema.casos.id, casoId));
    await auditar(u.id, c.risco ? "risco_tratado" : "dados_corrigidos", casoId);
    return { ok: true, mensagem: `${c.nome} voltou para o acolhimento.` };
  });
}

// --- Escolha de terapeuta (2.2) -----------------------------------------------

const PUBLICO_DO_CASO: Record<LinhaCaso["publico"], Publico> = { Adulto: "Adultos", Adolescente: "Adolescentes", "Criança": "Crianças" };

type Executor = Pick<typeof db, "select">;

async function ocupacao(terapeutaId: string, exec: Executor = db) {
  const [r] = await exec
    .select({ n: count() })
    .from(schema.casos)
    .where(and(eq(schema.casos.terapeutaId, terapeutaId), eq(schema.casos.status, "atendimento")));
  return r?.n ?? 0;
}

export async function encaminhar(casoId: string, terapeutaId: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    const t = await buscarTerapeuta(terapeutaId);
    if (!c || !t) return falha("Caso ou terapeuta não encontrado.");
    if (c.status !== "escolha") return falha("Este caso não está aguardando escolha de terapeuta.");
    if (!t.ativo) return falha(`${t.nome} está pausado.`);
    if (!t.publico.includes(PUBLICO_DO_CASO[c.publico])) return falha(`${t.nome} não atende este público.`);
    const anteriores = await db.select().from(schema.retornos).where(eq(schema.retornos.casoId, casoId));
    if (anteriores.some((r) => r.terapeutaNome === t.nome)) return falha(`${t.nome} já atendeu este caso antes.`);
    const agora = new Date();
    // Trava a linha do terapeuta: dois encaminhamentos simultâneos não ocupam a mesma última vaga.
    const resultado = await db.transaction(async (tx) => {
      const [atual] = await tx.select({ vagas: schema.terapeutas.vagas }).from(schema.terapeutas).where(eq(schema.terapeutas.id, t.id)).for("update");
      if ((await ocupacao(t.id, tx)) >= atual.vagas) return "sem_vaga" as const;
      const atualizados = await tx
        .update(schema.casos)
        .set({
          ...mudarStatus("atendimento"),
          terapeutaId: t.id,
          encaminhadoEm: agora,
          // Marcações voltam ao padrão; o termo segue o aceite online, se houver (2.3).
          termoOk: !!c.aceiteEm,
          repasseOk: false,
          primeiroOk: false,
        })
        .where(and(eq(schema.casos.id, casoId), eq(schema.casos.status, "escolha")))
        .returning({ id: schema.casos.id });
      return atualizados.length ? ("ok" as const) : ("mudou" as const);
    });
    if (resultado === "sem_vaga") return falha(`${t.nome} não tem vagas livres.`);
    if (resultado === "mudou") return falha("Este caso acabou de ser alterado por outra pessoa. Atualize a página.");

    await enviarEmail({
      para: t.email,
      assunto: `Novo encaminhamento: ${c.nome}`,
      corpo: `Olá, ${primeiroNome(t.nome)}.\n\nSegue a ficha de ${c.nome}.\n\n${textoFicha(c)}\n\n${textoOrientacao()}\n\nEquipe Projeto Florescer`,
      casoId,
    });
    await auditar(u.id, "encaminhado", casoId, t.nome);
    return { ok: true, mensagem: `Encaminhamento registrado: ${c.nome} → ${t.nome}. Ficha e termo de orientação enviados.` };
  });
}

// --- Em atendimento (2.3) -----------------------------------------------------

export type Marcacao = "termoOk" | "repasseOk" | "primeiroOk";

export async function marcar(casoId: string, campo: Marcacao, valor: boolean) {
  return comUsuario(async (u) => {
    if (!["termoOk", "repasseOk", "primeiroOk"].includes(campo)) return falha("Marcação inválida.");
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status !== "atendimento") return falha("As marcações só valem em atendimento.");
    await db.update(schema.casos).set({ [campo]: valor }).where(eq(schema.casos.id, casoId));
    await auditar(u.id, `marcacao_${campo}`, casoId, String(valor));
    return { ok: true };
  });
}

export async function retornarParaEscolha(casoId: string, motivo: string, observacao: string) {
  return comUsuario(async (u) => {
    if (!MOTIVOS_RETORNO.includes(motivo)) return falha("Escolha o motivo do retorno.");
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status !== "atendimento") return falha("Só casos em atendimento podem retornar.");
    const t = await buscarTerapeuta(c.terapeutaId);

    await db.transaction(async (tx) => {
      await tx.insert(schema.retornos).values({ casoId, terapeutaNome: t?.nome ?? "—", motivo, observacao: observacao.trim().slice(0, 2000) });
      await tx
        .update(schema.casos)
        .set({ ...mudarStatus("escolha"), terapeutaId: null, encaminhadoEm: null, termoOk: !!c.aceiteEm, repasseOk: false, primeiroOk: false })
        .where(eq(schema.casos.id, casoId));
    });
    await auditar(u.id, "retorno_para_escolha", casoId, motivo);
    return { ok: true, mensagem: `${c.nome} voltou para a escolha de terapeuta.${t ? ` Vaga de ${t.nome} liberada.` : ""}` };
  });
}

export async function desligar(casoId: string, motivo: string) {
  return comUsuario(async (u) => {
    if (!MOTIVOS_DESLIGAMENTO.includes(motivo)) return falha("Escolha o motivo do desligamento.");
    const c = await buscarCaso(casoId);
    if (!c) return falha("Caso não encontrado.");
    if (c.status === "desligado") return falha("Este caso já foi desligado.");
    const t = await buscarTerapeuta(c.terapeutaId);
    // O vínculo com o terapeuta fica no histórico; a vaga é liberada porque o caso sai de "atendimento".
    await db.update(schema.casos).set({ ...mudarStatus("desligado"), motivoDesligamento: motivo }).where(eq(schema.casos.id, casoId));
    await auditar(u.id, "desligado", casoId, motivo);
    return { ok: true, mensagem: `Desligamento de ${c.nome} registrado.${t && c.status === "atendimento" ? ` Vaga de ${t.nome} liberada.` : ""}` };
  });
}

// --- Lembretes e reenvios (3) -------------------------------------------------

export async function enviarLembrete(casoId: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    if (!c || c.status !== "atendimento") return falha("Não há lembrete a enviar para este caso.");
    const t = await buscarTerapeuta(c.terapeutaId);
    const dias = diasDesde(c.statusDesde);

    if (!c.termoOk && dias > 7) {
      await enviarEmail({
        para: c.email,
        assunto: "Lembrete: termo de compromisso do Projeto Florescer",
        corpo: `Olá, ${primeiroNome(c.nome)}.\n\nAinda não recebemos o aceite do seu termo de compromisso. Leva poucos minutos:\n\n${linkTermo(c)}\n\nCom carinho,\nEquipe Projeto Florescer`,
        casoId,
      });
      await auditar(u.id, "lembrete_termo", casoId);
      return { ok: true, mensagem: `Lembrete enviado a ${c.nome}.` };
    }
    if (!c.primeiroOk && diasUteis(dias) > 5 && t) {
      await enviarEmail({
        para: t.email,
        assunto: `Lembrete: 1º atendimento de ${c.nome}`,
        corpo: `Olá, ${primeiroNome(t.nome)}.\n\nAinda não recebemos a confirmação do primeiro atendimento de ${c.nome}. Pode responder a este e-mail com a data combinada?\n\nEquipe Projeto Florescer`,
        casoId,
      });
      await auditar(u.id, "lembrete_primeiro_atendimento", casoId);
      return { ok: true, mensagem: `Lembrete enviado a ${t.nome}.` };
    }
    return falha("Este caso não está parado.");
  });
}

export async function reenviarFicha(casoId: string) {
  return comUsuario(async (u) => {
    const c = await buscarCaso(casoId);
    const t = c && (await buscarTerapeuta(c.terapeutaId));
    if (!c || !t) return falha("Este caso não tem terapeuta definido.");
    await enviarEmail({ para: t.email, assunto: `Novo encaminhamento: ${c.nome}`, corpo: `${textoFicha(c)}\n\n${textoOrientacao()}`, casoId });
    await auditar(u.id, "ficha_reenviada", casoId, t.nome);
    return { ok: true, mensagem: `Ficha reenviada a ${t.nome}.` };
  });
}

// --- Cadastros (5) ------------------------------------------------------------

const PUBLICOS: Publico[] = ["Crianças", "Adolescentes", "Adultos"];

type DadosTerapeuta = { name: string; email: string; genero: string; publico: Publico[]; disp: string; cap: number };

/** Validação comum ao cadastro e à edição; devolve a linha pronta para gravar ou a mensagem de erro. */
function validarTerapeuta(d: DadosTerapeuta) {
  const nome = d.name.trim();
  const publico = PUBLICOS.filter((p) => d.publico.includes(p));
  const genero = GENEROS_TERAPEUTA.find((g) => g === d.genero);
  if (!nome) return "Informe o nome.";
  if (!emailValido(d.email)) return "E-mail inválido.";
  if (!genero) return "Informe o gênero.";
  if (!publico.length) return "Escolha ao menos um público.";
  if (!d.disp.trim()) return "Informe a disponibilidade.";
  if (!Number.isInteger(d.cap) || d.cap < 1 || d.cap > 15) return "Vagas devem ficar entre 1 e 15.";
  return { nome, email: d.email.trim().toLowerCase(), genero, publico, disponibilidade: d.disp.trim(), vagas: d.cap };
}

/** O nome identifica o terapeuta nos casos e no histórico de retornos, então não pode se repetir. */
async function nomeEmUso(nome: string, exceto?: string) {
  const ts = await db.select({ id: schema.terapeutas.id, nome: schema.terapeutas.nome }).from(schema.terapeutas);
  return ts.some((t) => t.id !== exceto && t.nome.toLowerCase() === nome.toLowerCase());
}

export async function cadastrarTerapeuta(d: DadosTerapeuta) {
  return comUsuario(async (u) => {
    const v = validarTerapeuta(d);
    if (typeof v === "string") return falha(v);
    if (await nomeEmUso(v.nome)) return falha(`Já existe um terapeuta chamado ${v.nome}.`);
    await db.insert(schema.terapeutas).values({ id: crypto.randomUUID(), ...v });
    await auditar(u.id, "terapeuta_cadastrado", undefined, v.nome);
    return { ok: true, mensagem: `${v.nome} entrou na lista de terapeutas e já aparece nas sugestões.` };
  });
}

const ROTULOS_TERAPEUTA = {
  nome: "nome",
  email: "e-mail",
  genero: "gênero",
  publico: "público",
  disponibilidade: "disponibilidade",
  vagas: "vagas",
  ativo: "status",
} as const;

export async function editarTerapeuta(id: string, d: DadosTerapeuta & { active: boolean }) {
  return comUsuario(async (u) => {
    const t = await buscarTerapeuta(id);
    if (!t) return falha("Terapeuta não encontrado.");
    const v = validarTerapeuta(d);
    if (typeof v === "string") return falha(v);
    if (await nomeEmUso(v.nome, id)) return falha(`Já existe um terapeuta chamado ${v.nome}.`);
    const novo = { ...v, ativo: d.active };

    const mudou = (Object.keys(ROTULOS_TERAPEUTA) as (keyof typeof ROTULOS_TERAPEUTA)[]).filter(
      (k) => JSON.stringify(novo[k]) !== JSON.stringify(t[k]),
    );
    if (!mudou.length) return { ok: true, mensagem: "Nada mudou." };

    return db.transaction(async (tx) => {
      // Trava a linha: um encaminhamento simultâneo não pode ocupar uma vaga que a edição está tirando.
      await tx.select({ id: schema.terapeutas.id }).from(schema.terapeutas).where(eq(schema.terapeutas.id, id)).for("update");
      const ocupadas = await ocupacao(id, tx);
      if (novo.vagas < ocupadas) {
        return falha(`${t.nome} tem ${ocupadas} pessoas em atendimento; as vagas não podem ficar abaixo disso.`);
      }
      await tx.update(schema.terapeutas).set(novo).where(eq(schema.terapeutas.id, id));
      // Os retornos guardam o nome do terapeuta; sem isso, quem já atendeu um caso voltaria a ser sugerido para ele.
      if (novo.nome !== t.nome) {
        await tx.update(schema.retornos).set({ terapeutaNome: novo.nome }).where(eq(schema.retornos.terapeutaNome, t.nome));
      }
      await tx.insert(schema.auditoria).values({
        usuarioId: u.id,
        acao: "terapeuta_editado",
        detalhe: `${novo.nome}: ${mudou.map((k) => ROTULOS_TERAPEUTA[k]).join(", ")}`,
      });
      return { ok: true, mensagem: `Cadastro de ${novo.nome} atualizado.` } as Resultado;
    });
  });
}

const CONVITE_VALIDADE_MS = 7 * 24 * 60 * 60 * 1000;

export async function convidarUsuario(d: { name: string; email: string }) {
  return comUsuario(async (u) => {
    const nome = d.name.trim();
    const email = d.email.trim().toLowerCase();
    if (!nome) return falha("Informe o nome.");
    if (!emailValido(email)) return falha("E-mail inválido.");
    const [existe] = await db.select({ id: schema.usuarios.id }).from(schema.usuarios).where(eq(schema.usuarios.email, email));
    if (existe) return falha("Já existe um usuário com este e-mail.");

    const token = novoToken();
    await db.insert(schema.usuarios).values({
      id: crypto.randomUUID(),
      nome,
      email,
      status: "convite",
      conviteToken: token,
      conviteExpira: new Date(Date.now() + CONVITE_VALIDADE_MS),
    });
    const link = `${urlBase()}/convite/${token}`;
    await enviarEmail({
      para: email,
      assunto: "Convite para o painel do Projeto Florescer",
      corpo: `Olá, ${primeiroNome(nome)}.\n\n${u.nome} convidou você para o painel do Projeto Florescer. Crie sua senha neste link (válido por 7 dias):\n\n${link}`,
    });
    await auditar(u.id, "usuario_convidado", undefined, email);
    return { ok: true, mensagem: `Convite enviado a ${nome}.`, link };
  });
}
