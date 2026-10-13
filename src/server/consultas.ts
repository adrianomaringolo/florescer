import "server-only";

import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Caso, Terapeuta, Usuario } from "@/lib/dados";
import { dataHoraCompleta, diaMes, diaMesHora, diasDesde, ultimoAcesso } from "./datas";

// Converte linhas do banco nos tipos usados pela interface (src/lib/dados.ts).

type LinhaCaso = typeof schema.casos.$inferSelect;
type LinhaTerapeuta = typeof schema.terapeutas.$inferSelect;
type LinhaRetorno = typeof schema.retornos.$inferSelect;

export function paraTerapeuta(t: LinhaTerapeuta): Terapeuta {
  return { id: t.id, name: t.nome, email: t.email, genero: t.genero, publico: t.publico, disp: t.disponibilidade, cap: t.vagas, active: t.ativo };
}

export function paraCaso(c: LinhaCaso, terapeutas: Map<string, LinhaTerapeuta>, retornos: LinhaRetorno[]): Caso {
  return {
    id: c.id,
    name: c.nome,
    age: c.idade,
    email: c.email,
    phone: c.telefone,
    motivo: c.motivo,
    disp: c.disponibilidade,
    publico: c.publico,
    status: c.status,
    days: diasDesde(c.statusDesde),
    ter: c.terapeutaId ? (terapeutas.get(c.terapeutaId)?.nome ?? "") : "",
    recv: diaMesHora(c.recebidoEm),
    risk: c.risco,
    termoOk: c.termoOk,
    repasseOk: c.repasseOk,
    primeiroOk: c.primeiroOk,
    encaminhadoEm: c.encaminhadoEm ? diaMes(c.encaminhadoEm) : undefined,
    motivoDeslig: c.motivoDesligamento ?? undefined,
    retornos: retornos.map((r) => ({ de: r.terapeutaNome, motivo: r.motivo, obs: r.observacao, data: diaMes(r.criadoEm) })),
    aceite: c.aceiteEm ? { nome: c.aceiteNome ?? "", menor: c.aceiteMenor ?? undefined, quando: dataHoraCompleta(c.aceiteEm) } : undefined,
    termoToken: c.termoToken,
    boasVindasEm: c.boasVindasEm ? diaMes(c.boasVindasEm) : undefined,
    ficha: c.ficha ?? undefined,
    consentimentoEm: c.consentimentoEm ? dataHoraCompleta(c.consentimentoEm) : undefined,
  };
}

/** Tudo que o painel precisa. O volume do projeto é pequeno o bastante para carregar de uma vez. */
export async function carregarPainel() {
  const [ts, cs, rs, us] = await Promise.all([
    db.select().from(schema.terapeutas).orderBy(asc(schema.terapeutas.criadoEm), asc(schema.terapeutas.nome)),
    db.select().from(schema.casos).orderBy(asc(schema.casos.recebidoEm)),
    db.select().from(schema.retornos).orderBy(asc(schema.retornos.criadoEm), asc(schema.retornos.id)),
    db.select().from(schema.usuarios).orderBy(asc(schema.usuarios.criadoEm)),
  ]);
  const porId = new Map(ts.map((t) => [t.id, t]));
  const retornosPorCaso = new Map<string, LinhaRetorno[]>();
  for (const r of rs) retornosPorCaso.set(r.casoId, [...(retornosPorCaso.get(r.casoId) ?? []), r]);

  const usuarios: Usuario[] = us.map((u) => ({ id: u.id, name: u.nome, email: u.email, last: ultimoAcesso(u.ultimoAcesso), status: u.status, senhaProvisoria: u.trocarSenha }));
  return {
    terapeutas: ts.map(paraTerapeuta),
    casos: cs.map((c) => paraCaso(c, porId, retornosPorCaso.get(c.id) ?? [])),
    usuarios,
  };
}

export type DadosPainel = Awaited<ReturnType<typeof carregarPainel>>;

/** Dados mínimos para a página pública do termo — nada além do necessário. */
export async function casoPorTokenDoTermo(token: string) {
  const [c] = await db
    .select({
      id: schema.casos.id,
      nome: schema.casos.nome,
      idade: schema.casos.idade,
      aceiteNome: schema.casos.aceiteNome,
      aceiteMenor: schema.casos.aceiteMenor,
      aceiteEm: schema.casos.aceiteEm,
    })
    .from(schema.casos)
    .where(eq(schema.casos.termoToken, token));
  if (!c) return null;
  return {
    primeiroNome: c.nome.trim().split(/\s+/)[0] ?? "",
    menorDeIdade: c.idade !== null && c.idade < 18,
    aceite: c.aceiteEm ? { nome: c.aceiteNome ?? "", menor: c.aceiteMenor ?? undefined, quando: dataHoraCompleta(c.aceiteEm) } : null,
  };
}
