import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { FichaFormulario, GeneroTerapeuta, Publico, StatusKey, UsuarioStatus } from "@/lib/dados";

// Ver docs/referencias e o README para o significado de cada campo.

const data = (nome: string) => timestamp(nome, { withTimezone: true, mode: "date" });
const criadoEm = () => data("criado_em").notNull().defaultNow();

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash"),
  status: text("status").$type<UsuarioStatus>().notNull().default("convite"),
  conviteToken: text("convite_token").unique(),
  conviteExpira: data("convite_expira"),
  ultimoAcesso: data("ultimo_acesso"),
  criadoEm: criadoEm(),
});

export const sessoes = pgTable(
  "sessoes",
  {
    /** SHA-256 do token do cookie — o token em si nunca é guardado. */
    id: text("id").primaryKey(),
    usuarioId: text("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
    expira: data("expira").notNull(),
    criadoEm: criadoEm(),
  },
  (t) => [index("sessoes_usuario_idx").on(t.usuarioId)],
);

export const terapeutas = pgTable("terapeutas", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  genero: text("genero").$type<GeneroTerapeuta | "">().notNull().default(""),
  publico: jsonb("publico").$type<Publico[]>().notNull(),
  disponibilidade: text("disponibilidade").notNull(),
  vagas: integer("vagas").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: criadoEm(),
});

export const casos = pgTable(
  "casos",
  {
    id: text("id").primaryKey(),
    nome: text("nome").notNull(),
    idade: integer("idade"),
    email: text("email").notNull().default(""),
    telefone: text("telefone").notNull().default(""),
    motivo: text("motivo").notNull().default(""),
    disponibilidade: text("disponibilidade").notNull().default(""),
    publico: text("publico").$type<"Adulto" | "Adolescente" | "Criança">().notNull(),
    status: text("status").$type<StatusKey>().notNull().default("acolhimento"),
    statusDesde: data("status_desde").notNull(),
    recebidoEm: data("recebido_em").notNull(),
    risco: boolean("risco").notNull().default(false),
    terapeutaId: text("terapeuta_id").references(() => terapeutas.id),
    encaminhadoEm: data("encaminhado_em"),
    termoOk: boolean("termo_ok").notNull().default(false),
    repasseOk: boolean("repasse_ok").notNull().default(false),
    primeiroOk: boolean("primeiro_ok").notNull().default(false),
    boasVindasEm: data("boas_vindas_em"),
    motivoDesligamento: text("motivo_desligamento"),
    /** Link individual do termo de compromisso (4.3). */
    termoToken: text("termo_token").notNull().unique(),
    aceiteNome: text("aceite_nome"),
    aceiteMenor: text("aceite_menor"),
    aceiteEm: data("aceite_em"),
    /** Demais respostas do formulário público; nulo nos casos vindos da integração. */
    ficha: jsonb("ficha").$type<FichaFormulario>(),
    /** Aceite do termo de tratamento de dados (LGPD) no formulário. */
    consentimentoEm: data("consentimento_em"),
    criadoEm: criadoEm(),
  },
  (t) => [index("casos_status_idx").on(t.status), index("casos_terapeuta_idx").on(t.terapeutaId)],
);

export const retornos = pgTable(
  "retornos",
  {
    id: serial("id").primaryKey(),
    casoId: text("caso_id").notNull().references(() => casos.id, { onDelete: "cascade" }),
    terapeutaNome: text("terapeuta_nome").notNull(),
    motivo: text("motivo").notNull(),
    observacao: text("observacao").notNull().default(""),
    criadoEm: criadoEm(),
  },
  (t) => [index("retornos_caso_idx").on(t.casoId)],
);

/** Log de auditoria (5.2): todo acesso e alteração em dados de pacientes. */
export const auditoria = pgTable(
  "auditoria",
  {
    id: serial("id").primaryKey(),
    usuarioId: text("usuario_id").references(() => usuarios.id),
    acao: text("acao").notNull(),
    casoId: text("caso_id"),
    detalhe: text("detalhe"),
    criadoEm: criadoEm(),
  },
  (t) => [index("auditoria_caso_idx").on(t.casoId)],
);

/** Caixa de saída: e-mails gerados pelo sistema. Um provedor real consome daqui. */
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  para: text("para").notNull(),
  assunto: text("assunto").notNull(),
  corpo: text("corpo").notNull(),
  casoId: text("caso_id"),
  criadoEm: criadoEm(),
});
