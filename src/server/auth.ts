import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/db";

export const COOKIE_SESSAO = "florescer_sessao";
const DURACAO_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const novoToken = () => randomBytes(32).toString("base64url");

export async function criarSessao(usuarioId: string) {
  const token = novoToken();
  const expira = new Date(Date.now() + DURACAO_MS);
  await db.insert(schema.sessoes).values({ id: hashToken(token), usuarioId, expira });
  await db.update(schema.usuarios).set({ ultimoAcesso: new Date() }).where(eq(schema.usuarios.id, usuarioId));
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expira,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (token) await db.delete(schema.sessoes).where(eq(schema.sessoes.id, hashToken(token)));
  jar.delete(COOKIE_SESSAO);
}

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
}

/** Usuário da sessão atual, ou null. Cacheado por requisição. */
export const usuarioAtual = cache(async (): Promise<UsuarioLogado | null> => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  const [linha] = await db
    .select({ id: schema.usuarios.id, nome: schema.usuarios.nome, email: schema.usuarios.email, status: schema.usuarios.status })
    .from(schema.sessoes)
    .innerJoin(schema.usuarios, eq(schema.sessoes.usuarioId, schema.usuarios.id))
    .where(and(eq(schema.sessoes.id, hashToken(token)), gt(schema.sessoes.expira, new Date())));
  if (!linha || linha.status !== "ativo") return null;
  return { id: linha.id, nome: linha.nome, email: linha.email };
});

/** Para páginas: redireciona ao login se não houver sessão válida. */
export async function exigirUsuario() {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  return u;
}
