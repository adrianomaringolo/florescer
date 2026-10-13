import "server-only";

import { db, schema } from "@/db";

/** Log de auditoria (5.2). */
export async function auditar(usuarioId: string | null, acao: string, casoId?: string, detalhe?: string) {
  await db.insert(schema.auditoria).values({ usuarioId, acao, casoId, detalhe });
}

/**
 * Coloca um e-mail na caixa de saída. Ainda não há provedor de envio configurado:
 * o e-mail fica na tabela `emails` e é exibido no log do servidor.
 */
export async function enviarEmail(e: { para: string; assunto: string; corpo: string; casoId?: string }) {
  await db.insert(schema.emails).values(e);
  console.info(`[email] para=${e.para} assunto="${e.assunto}"`);
}

export const urlBase = () => process.env.APP_URL ?? "http://localhost:3002";
