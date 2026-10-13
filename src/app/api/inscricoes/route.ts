import { NextResponse } from "next/server";
import { registrarInscricao } from "@/server/casos";
import { corpo } from "@/server/http";

// Formulário público de solicitação de atendimento (/solicitar). Sem autenticação:
// protegido por um campo-isca e por um limite de envios por IP.

const JANELA_MS = 10 * 60 * 1000;
const MAX_ENVIOS = 5;
// Em memória: vale por instância do servidor. Suficiente contra envios repetidos acidentais e robôs simples.
const envios = new Map<string, number[]>();

function excedeuLimite(ip: string) {
  const agora = Date.now();
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_ENVIOS) return true;
  envios.set(ip, [...recentes, agora]);
  return false;
}

export async function POST(req: Request) {
  const d = await corpo(req);
  // Campo-isca invisível: pessoas não o preenchem, robôs sim. Responde como sucesso para não dar pista.
  if (typeof d.site === "string" && d.site.trim()) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (excedeuLimite(ip)) {
    return NextResponse.json({ ok: false, erro: "Recebemos vários envios seguidos deste endereço. Aguarde alguns minutos e tente de novo." }, { status: 429 });
  }

  const r = await registrarInscricao(d);
  return NextResponse.json(r, { status: r.ok ? 201 : 400 });
}
