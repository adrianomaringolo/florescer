import { GENEROS_TERAPEUTA, primeiroNome, type Caso, type Publico, type StatusKey, type Terapeuta } from "./dados";

export interface StatusInfo {
  k: StatusKey;
  label: string;
  short: string;
  dot: string;
}

// Cores dos status partem da paleta da marca; terracota fica reservada a problemas.
export const STATUS: StatusInfo[] = [
  { k: "acolhimento", label: "Em acolhimento", short: "Acolhimento", dot: "bg-bruma-escura" },
  { k: "escolha", label: "Aguardando escolha de terapeuta", short: "Escolha de terapeuta", dot: "bg-caramelo" },
  { k: "atendimento", label: "Em atendimento", short: "Em atendimento", dot: "bg-ameixa" },
  { k: "desligado", label: "Desligado", short: "Desligado", dot: "bg-areia" },
  { k: "pendente", label: "Pendente / com problema", short: "Pendente", dot: "bg-terracota" },
];

export const statusInfo = (k: StatusKey) => STATUS.find((s) => s.k === k)!;

export const plural = (n: number, um: string, varios = `${um}s`) => `${n} ${n === 1 ? um : varios}`;

/** "há 3 dias" / "desde hoje" */
export const haDias = (n: number) => (n === 0 ? "desde hoje" : `há ${plural(n, "dia")}`);

// --- Terapeutas (1.2) ---------------------------------------------------------

/** Pacientes em atendimento são derivados dos casos ligados ao terapeuta. */
export const pacientesDe = (t: Terapeuta, casos: Caso[]) => casos.filter((c) => c.status === "atendimento" && c.ter === t.name);
export const ocupacao = (t: Terapeuta, casos: Caso[]) => pacientesDe(t, casos).length;
/** Terapeuta pausado conta com 0 vagas livres. */
export const vagasLivres = (t: Terapeuta, casos: Caso[]) => (t.active ? Math.max(0, t.cap - ocupacao(t, casos)) : 0);
export const lotado = (t: Terapeuta, casos: Caso[]) => ocupacao(t, casos) >= t.cap;

export const formatarPublico = (p: Publico[]) =>
  p.length <= 1 ? (p[0] ?? "") : `${p.slice(0, -1).join(", ")} e ${p[p.length - 1].toLowerCase()}`;

export const emailValido = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim());

// --- Casos (1.1, 2.5, 3) -------------------------------------------------------

/** 2.5 — e-mail inválido e telefone vazio levam o caso para Pendente. */
export const contatoIncompleto = (c: Caso) => !emailValido(c.email) && !c.phone.trim();

export const problemaContato = (c: Caso) =>
  contatoIncompleto(c) ? "E-mail inválido e telefone ausente" : undefined;

/** Aproximação de dias úteis a partir de dias corridos no status. */
export const diasUteis = (dias: number) => dias - 2 * Math.floor(dias / 7);

/** 3 — casos parados em atendimento. */
export function parado(c: Caso): { texto: string; lembretePara: "paciente" | "terapeuta" } | undefined {
  if (c.status !== "atendimento") return;
  if (!c.termoOk && c.days > 7) return { texto: `Termo não assinado há ${c.days} dias`, lembretePara: "paciente" };
  if (!c.primeiroOk && diasUteis(c.days) > 5)
    return { texto: `Terapeuta não confirmou 1º atendimento (${diasUteis(c.days)} dias úteis)`, lembretePara: "terapeuta" };
}

export const ultimoRetorno = (c: Caso) => c.retornos?.[c.retornos.length - 1];

// --- Sugestão de terapeutas -------------------------------------------------

const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"] as const;
const PERIODOS = ["manhã", "tarde", "noite"] as const;
const NOMES_DIA: Record<string, string> = { seg: "segunda", ter: "terça", qua: "quarta", qui: "quinta", sex: "sexta", "sáb": "sábado", dom: "domingo" };

function normaliza(s: string) {
  return s.toLowerCase().replace(/manhãs/g, "manhã").replace(/tardes/g, "tarde").replace(/noites/g, "noite").replace(/sab\b/g, "sáb");
}

/** Lê textos livres como "Seg e Qua à noite; Sex à tarde" em pares dia/período. */
export function parseDisponibilidade(texto: string) {
  const slots = new Set<string>();
  const t = normaliza(texto);
  const qualquerDia = /qualquer dia/.test(t);
  for (const parte of t.split(";")) {
    let dias: string[] = [];
    const faixa = parte.match(/(seg|ter|qua|qui|sex|sáb|dom)\w*\s+a\s+(seg|ter|qua|qui|sex|sáb|dom)/);
    if (faixa) {
      const i = DIAS.indexOf(faixa[1] as (typeof DIAS)[number]);
      const j = DIAS.indexOf(faixa[2] as (typeof DIAS)[number]);
      dias = DIAS.slice(i, j + 1) as unknown as string[];
    } else {
      dias = DIAS.filter((d) => new RegExp(`\\b${d}`).test(parte));
    }
    if (!dias.length || qualquerDia) dias = [...DIAS];
    let periodos = PERIODOS.filter((p) => parte.includes(p)) as string[];
    if (!periodos.length) periodos = [...PERIODOS];
    for (const d of dias) for (const p of periodos) slots.add(`${d}|${p}`);
  }
  return slots;
}

const PUBLICO_DO_CASO: Record<Caso["publico"], Publico> = { Adulto: "Adultos", Adolescente: "Adolescentes", "Criança": "Crianças" };
const atendePublico = (t: Terapeuta, publico: Caso["publico"]) => t.publico.includes(PUBLICO_DO_CASO[publico]);

export interface Sugestao {
  terapeuta: Terapeuta;
  livres: number;
  porque: string;
}

export interface ForaDaSugestao {
  terapeuta: Terapeuta;
  motivo: string;
}

/** "Mulher" ou "Homem" quando a pessoa pediu um gênero de terapeuta no formulário. */
function generoPreferido(caso: Caso) {
  const p = caso.ficha?.preferenciaTerapeuta;
  return GENEROS_TERAPEUTA.find((g) => g !== "Outro" && g === p);
}

function textoPreferencia(t: Terapeuta, preferido: string) {
  const alvo = preferido.toLowerCase();
  if (t.genero === preferido) return `Atende à preferência por terapeuta ${alvo}.`;
  if (!t.genero) return `A pessoa prefere terapeuta ${alvo} e o gênero de ${primeiroNome(t.name)} não está cadastrado.`;
  return `A pessoa prefere terapeuta ${alvo}.`;
}

/**
 * 2.2 — Público, status Ativo e vaga livre são eliminatórios; a preferência de
 * gênero e a disponibilidade só classificam, nessa ordem. O terapeuta de quem o
 * caso retornou nunca é sugerido de novo.
 */
export function sugerirTerapeutas(caso: Caso, terapeutas: Terapeuta[], casos: Caso[]) {
  const desejado = parseDisponibilidade(caso.disp);
  const preferido = generoPreferido(caso);
  const anteriores = new Set((caso.retornos ?? []).map((r) => r.de));
  const candidatos: (Sugestao & { score: number })[] = [];
  const fora: ForaDaSugestao[] = [];

  for (const t of terapeutas) {
    if (anteriores.has(t.name)) { fora.push({ terapeuta: t, motivo: "atendeu este caso antes" }); continue; }
    if (!atendePublico(t, caso.publico)) { fora.push({ terapeuta: t, motivo: `não atende ${PUBLICO_DO_CASO[caso.publico].toLowerCase()}` }); continue; }
    if (!t.active) { fora.push({ terapeuta: t, motivo: "pausado" }); continue; }
    const livres = vagasLivres(t, casos);
    if (!livres) { fora.push({ terapeuta: t, motivo: "sem vagas" }); continue; }

    const comuns = [...parseDisponibilidade(t.disp)].filter((s) => desejado.has(s));
    const partes: string[] = [];
    if (preferido) partes.push(textoPreferencia(t, preferido));
    if (comuns.length) {
      const dias = [...new Set(comuns.map((s) => s.split("|")[0]))];
      const periodos = [...new Set(comuns.map((s) => s.split("|")[1]))];
      const quando = dias.length >= 5 ? "vários dias" : dias.map((d) => NOMES_DIA[d]).join(", ").replace(/, ([^,]*)$/, " e $1");
      partes.push(`Horários em comum: ${quando}, ${periodos.join(" e ")}.`);
    } else {
      partes.push("Sem horário em comum informado — confirme com a pessoa.");
    }
    partes.push(`${plural(livres, "vaga livre", "vagas livres")}.`, `Atende ${formatarPublico(t.publico).toLowerCase()}.`);
    candidatos.push({ terapeuta: t, livres, porque: partes.join(" "), score: (preferido && t.genero === preferido ? 1000 : 0) + comuns.length * 10 + livres });
  }

  candidatos.sort((a, b) => b.score - a.score);
  for (const c of candidatos.slice(3)) fora.push({ terapeuta: c.terapeuta, motivo: "menos compatível" });
  return { sugestoes: candidatos.slice(0, 3), fora };
}

// --- Precisa da sua decisão (3) -----------------------------------------------

export type TipoDecisao = "risco" | "contato" | "parado" | "escolha" | "acolhimento";

export interface Decisao {
  tipo: TipoDecisao;
  caso: Caso;
  texto: string;
}

const ORDEM: TipoDecisao[] = ["risco", "contato", "parado", "escolha", "acolhimento"];

/** Ordem de urgência: risco → dados incompletos → parados → aguardando escolha → acolhimento. */
export function decisoesPendentes(casos: Caso[]): Decisao[] {
  const lista: Decisao[] = [];
  for (const c of casos) {
    if (c.status === "pendente" && c.risk) lista.push({ tipo: "risco", caso: c, texto: "Formulário menciona risco — fluxo pausado" });
    else if (c.status === "pendente") lista.push({ tipo: "contato", caso: c, texto: problemaContato(c) ?? "Dados incompletos" });
    const p = parado(c);
    if (p) lista.push({ tipo: "parado", caso: c, texto: p.texto });
    if (c.status === "escolha") lista.push({ tipo: "escolha", caso: c, texto: `Aguardando escolha de terapeuta · ${haDias(c.days)}` });
    if (c.status === "acolhimento") lista.push({ tipo: "acolhimento", caso: c, texto: `Em acolhimento · ${haDias(c.days)}` });
  }
  return lista.sort((a, b) => ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo) || b.caso.days - a.caso.days);
}
