import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { criarCaso, temSinalDeRisco } from "@/server/casos";

// Recebe uma solicitação do formulário (ex.: Apps Script da planilha ou Google Forms)
// e cria o caso. Autenticação: header `Authorization: Bearer <INTAKE_TOKEN>`.

const PUBLICOS = ["Adulto", "Adolescente", "Criança"] as const;

const igual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export async function POST(req: Request) {
  const esperado = process.env.INTAKE_TOKEN;
  const recebido = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!esperado || !igual(recebido, esperado)) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });

  let d: Record<string, unknown>;
  try {
    d = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const texto = (k: string, max = 500) => (typeof d[k] === "string" ? (d[k] as string).trim().slice(0, max) : "");
  const nome = texto("nome", 200);
  const publico = texto("publico") as (typeof PUBLICOS)[number];
  const idadeBruta = Number(d.idade);
  const idade = Number.isInteger(idadeBruta) && idadeBruta >= 0 && idadeBruta < 130 ? idadeBruta : null;
  if (!nome) return NextResponse.json({ erro: "nome é obrigatório" }, { status: 422 });
  if (!PUBLICOS.includes(publico)) return NextResponse.json({ erro: `publico deve ser um de: ${PUBLICOS.join(", ")}` }, { status: 422 });

  const caso = {
    nome,
    idade,
    email: texto("email", 200),
    telefone: texto("telefone", 40),
    motivo: texto("motivo", 4000),
    disponibilidade: texto("disponibilidade"),
    publico,
  };
  const risco = d.risco === true || temSinalDeRisco(caso.motivo);
  return NextResponse.json(await criarCaso({ ...caso, risco }, "integracao"), { status: 201 });
}
