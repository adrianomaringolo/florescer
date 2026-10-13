import "server-only";

import { db, schema } from "@/db";
import { DIAS_SEMANA, PERIODOS_DIA, type FichaFormulario } from "@/lib/dados";
import { emailValido } from "@/lib/regras";
import { novoToken } from "./auth";
import { auditar } from "./registro";

// Criação de casos: pela integração (/api/solicitacoes) e pelo formulário público (/api/inscricoes).

// Rede de segurança para 2.5 — não substitui a leitura humana do formulário.
const TERMOS_DE_RISCO = [/suic/i, /me matar/i, /se matar/i, /tirar (a )?minha (pr[oó]pria )?vida/i, /me machucar/i, /se machucar/i, /autoles/i, /automutila/i, /n[aã]o quero (mais )?viver/i];

export const temSinalDeRisco = (...textos: string[]) => textos.some((t) => TERMOS_DE_RISCO.some((r) => r.test(t)));

export interface NovoCaso {
  nome: string;
  idade: number | null;
  email: string;
  telefone: string;
  motivo: string;
  disponibilidade: string;
  publico: "Adulto" | "Adolescente" | "Criança";
  risco: boolean;
  ficha?: FichaFormulario;
  consentimentoEm?: Date;
}

export async function criarCaso(c: NovoCaso, origem: string) {
  // 2.5: risco ou contato incompleto levam o caso direto para Pendente.
  const incompleto = !emailValido(c.email) && !c.telefone.trim();
  const status = c.risco || incompleto ? ("pendente" as const) : ("acolhimento" as const);
  const agora = new Date();
  const id = crypto.randomUUID();
  await db.insert(schema.casos).values({ id, ...c, status, statusDesde: agora, recebidoEm: agora, termoToken: novoToken() });
  await auditar(null, "solicitacao_recebida", id, `${origem}: ${status}`);
  return { id, status, risco: c.risco };
}

// --- Formulário público ---------------------------------------------------------

export const IDADE_MINIMA = 18;

/** Idade completa na data de hoje, ou null se a data for inválida. */
export function idadeEm(nascimento: string, hoje = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nascimento);
  if (!m) return null;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(a, mes - 1, d));
  if (data.getUTCMonth() !== mes - 1 || data > hoje) return null;
  let idade = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < d)) idade--;
  return idade >= 0 && idade < 130 ? idade : null;
}

/** "Seg manhã, noite; Qua tarde" — formato lido por parseDisponibilidade. */
function textoDisponibilidade(grade: unknown) {
  if (!grade || typeof grade !== "object") return "";
  const partes: string[] = [];
  for (const dia of DIAS_SEMANA) {
    const v = (grade as Record<string, unknown>)[dia];
    const periodos = Array.isArray(v) ? PERIODOS_DIA.filter((p) => v.includes(p)) : [];
    if (periodos.length) partes.push(`${dia.slice(0, 3)} ${periodos.map((p) => p.toLowerCase()).join(", ")}`);
  }
  return partes.join("; ");
}

export type ResultadoInscricao = { ok: true } | { ok: false; erro: string; campo?: string };

/** Valida as respostas do formulário público e cria o caso. */
export async function registrarInscricao(d: Record<string, unknown>): Promise<ResultadoInscricao> {
  const t = (k: string, max = 500) => (typeof d[k] === "string" ? (d[k] as string).trim().replace(/\s+/g, " ").slice(0, max) : "");
  const longo = (k: string) => (typeof d[k] === "string" ? (d[k] as string).trim().slice(0, 4000) : "");
  const falta = (campo: string, erro: string): ResultadoInscricao => ({ ok: false, erro, campo });

  if (d.consentimento !== true) return falta("consentimento", "Para continuar, é preciso aceitar o termo de tratamento de dados.");
  if (d.cienteValor !== true) return falta("cienteValor", "Para continuar, confirme que está ciente do valor social da sessão.");

  const nome = t("nome", 200);
  if (nome.split(" ").length < 2) return falta("nome", "Informe seu nome completo.");
  const genero = t("genero", 80);
  if (!genero) return falta("genero", "Informe seu gênero.");
  const nascimento = t("nascimento", 10);
  const idade = idadeEm(nascimento);
  if (idade === null) return falta("nascimento", "Informe uma data de nascimento válida.");
  if (idade < IDADE_MINIMA) return falta("nascimento", "No momento, o Projeto Florescer atende apenas pessoas adultas (a partir de 18 anos).");

  const email = t("email", 200).toLowerCase();
  if (!emailValido(email)) return falta("email", "Informe um e-mail válido.");
  const telefone = t("telefone", 40);
  if (telefone.replace(/\D/g, "").length < 10) return falta("telefone", "Informe seu WhatsApp com DDD.");
  const contatoEmergencia = t("contatoEmergencia", 120);
  if (contatoEmergencia.replace(/\D/g, "").length < 10) return falta("contatoEmergencia", "Informe um telefone de emergência com DDD.");

  const obrigatorios: [string, string, string][] = [
    ["estadoCivil", "seu estado civil", t("estadoCivil", 80)],
    ["escolaridade", "sua escolaridade", t("escolaridade", 300)],
    ["trabalho", "se está trabalhando", t("trabalho", 300)],
    ["endereco", "seu endereço", t("endereco", 400)],
    ["rg", "seu RG", t("rg", 30)],
    ["psicoterapiaAnterior", "se já fez psicoterapia", longo("psicoterapiaAnterior")],
    ["medicamentos", "se toma remédios", longo("medicamentos")],
    ["diagnostico", "se tem algum diagnóstico", t("diagnostico", 500)],
    ["motivo", "o motivo da busca", longo("motivo")],
    ["preferenciaTerapeuta", "sua preferência de terapeuta", t("preferenciaTerapeuta", 80)],
  ];
  const vazio = obrigatorios.find(([, , v]) => !v);
  if (vazio) return falta(vazio[0], `Informe ${vazio[1]}.`);
  const v = Object.fromEntries(obrigatorios.map(([k, , val]) => [k, val])) as Record<string, string>;

  const ficha: FichaFormulario = {
    genero,
    nascimento,
    estadoCivil: v.estadoCivil!,
    escolaridade: v.escolaridade!,
    trabalho: v.trabalho!,
    endereco: v.endereco!,
    contatoEmergencia,
    rg: v.rg!,
    psicoterapiaAnterior: v.psicoterapiaAnterior!,
    medicamentos: v.medicamentos!,
    diagnostico: v.diagnostico!,
    preferenciaTerapeuta: v.preferenciaTerapeuta!,
    comentarios: longo("comentarios"),
  };

  await criarCaso(
    {
      nome,
      idade,
      email,
      telefone,
      motivo: v.motivo!,
      disponibilidade: textoDisponibilidade(d.disponibilidade),
      publico: "Adulto",
      risco: temSinalDeRisco(v.motivo!, ficha.comentarios, ficha.diagnostico),
      ficha,
      consentimentoEm: new Date(),
    },
    "formulario",
  );
  return { ok: true };
}
