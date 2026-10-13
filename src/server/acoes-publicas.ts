import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { criarSessao, encerrarSessao } from "./auth";
import { dataHoraCompleta } from "./datas";
import { auditar, enviarEmail } from "./registro";
import { SENHA_MINIMA, conferirSenha, gerarHash } from "./senha";

// Ações acessíveis sem sessão: login, aceite de convite e aceite do termo.

export interface EstadoForm {
  erro?: string;
}

export async function entrar(dados: { email: string; senha: string }): Promise<EstadoForm> {
  const email = dados.email.trim().toLowerCase();
  const senha = dados.senha;
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, email));
  // Mesma mensagem para e-mail inexistente e senha errada.
  const valido = !!u?.senhaHash && (await conferirSenha(senha, u.senhaHash));
  if (!u || !valido) return { erro: "E-mail ou senha incorretos." };
  if (u.status !== "ativo") return { erro: "Este acesso está desativado. Fale com a equipe." };
  await criarSessao(u.id);
  await auditar(u.id, "login");
  return {};
}

export async function sair() {
  await encerrarSessao();
}

export async function convitePorToken(token: string) {
  const [u] = await db
    .select({ nome: schema.usuarios.nome, email: schema.usuarios.email })
    .from(schema.usuarios)
    .where(and(eq(schema.usuarios.conviteToken, token), eq(schema.usuarios.status, "convite"), gt(schema.usuarios.conviteExpira, new Date())));
  return u ?? null;
}

export async function criarSenha(dados: { token: string; senha: string; confirmacao: string }): Promise<EstadoForm> {
  const { token, senha, confirmacao } = dados;
  if (senha.length < SENHA_MINIMA) return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` };
  if (senha !== confirmacao) return { erro: "As senhas não conferem." };

  const [u] = await db
    .select()
    .from(schema.usuarios)
    .where(and(eq(schema.usuarios.conviteToken, token), eq(schema.usuarios.status, "convite"), gt(schema.usuarios.conviteExpira, new Date())));
  if (!u) return { erro: "Este convite não é mais válido. Peça um novo à equipe." };

  await db
    .update(schema.usuarios)
    .set({ senhaHash: await gerarHash(senha), status: "ativo", conviteToken: null, conviteExpira: null })
    .where(eq(schema.usuarios.id, u.id));
  await criarSessao(u.id);
  await auditar(u.id, "convite_aceito");
  return {};
}

// --- Termo de compromisso (4.3) -----------------------------------------------

export async function aceitarTermo(token: string, nome: string, menor?: string): Promise<EstadoForm> {
  const nomeLimpo = nome.trim().replace(/\s+/g, " ").slice(0, 200);
  const menorLimpo = menor?.trim().replace(/\s+/g, " ").slice(0, 200);
  if (nomeLimpo.split(" ").length < 2) return { erro: "Digite seu nome completo." };

  const [c] = await db.select().from(schema.casos).where(eq(schema.casos.termoToken, token));
  if (!c) return { erro: "Link inválido." };
  if (c.aceiteEm) return { erro: "Este termo já foi aceito." };
  if (c.idade !== null && c.idade < 18 && !menorLimpo) return { erro: "Informe o nome da criança ou adolescente." };

  const agora = new Date();
  // O link vale para um único aceite: a condição em aceite_em evita aceites concorrentes.
  const atualizados = await db
    .update(schema.casos)
    .set({ aceiteNome: nomeLimpo, aceiteMenor: menorLimpo || null, aceiteEm: agora, termoOk: true })
    .where(and(eq(schema.casos.id, c.id), isNull(schema.casos.aceiteEm)))
    .returning({ id: schema.casos.id });
  if (atualizados.length === 0) return { erro: "Este termo já foi aceito." };

  await auditar(null, "termo_aceito", c.id, nomeLimpo);
  if (c.email.includes("@")) {
    await enviarEmail({
      para: c.email,
      assunto: "Cópia do seu termo de compromisso",
      corpo: `Olá, ${nomeLimpo.split(" ")[0]}.\n\nRegistramos o aceite do termo de compromisso do Projeto Florescer em ${dataHoraCompleta(agora)}, por ${nomeLimpo}${menorLimpo ? `, responsável por ${menorLimpo}` : ""}.\n\nEquipe Projeto Florescer`,
      casoId: c.id,
    });
  }
  return {};
}
