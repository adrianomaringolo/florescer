import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./index";
import { CASOS, TERAPEUTAS } from "./exemplo";
import { gerarHash } from "../server/senha";

// Popula o banco com os dados de exemplo do protótipo e cria a primeira pessoa usuária.
// Uso: pnpm db:seed   (SEED_ADMIN_EMAIL, SEED_ADMIN_NOME e SEED_ADMIN_SENHA opcionais)

const DIA = 24 * 60 * 60 * 1000;
const ano = new Date().getFullYear();
const agora = Date.now();

/** "05/10 · 14:20" ou "28/09" → Date no ano corrente */
function parseData(s: string | undefined, padrao: Date) {
  const m = s?.match(/(\d{2})\/(\d{2})(?:\s*·\s*(\d{2}):(\d{2}))?/);
  if (!m) return padrao;
  return new Date(ano, Number(m[2]) - 1, Number(m[1]), Number(m[3] ?? 9), Number(m[4] ?? 0));
}

const token = () => randomBytes(32).toString("base64url");

async function main() {
  const comExemplos = !process.argv.includes("--sem-exemplos");

  if (comExemplos) {
    const [jaTem] = await db.select({ id: schema.casos.id }).from(schema.casos).limit(1);
    if (jaTem) {
      console.log("O banco já tem casos — exemplos não foram inseridos.");
    } else {
      await db.insert(schema.terapeutas).values(
        TERAPEUTAS.map((t, i) => ({
          id: t.id,
          nome: t.name,
          email: t.email,
          genero: t.genero,
          publico: t.publico,
          disponibilidade: t.disp,
          vagas: t.cap,
          ativo: t.active,
          criadoEm: new Date(agora - (100 - i) * DIA),
        })),
      );
      const idPorNome = new Map(TERAPEUTAS.map((t) => [t.name, t.id]));
      await db.insert(schema.casos).values(
        CASOS.map((c) => {
          const statusDesde = new Date(agora - c.days * DIA - 60 * 60 * 1000);
          return {
            id: c.id,
            nome: c.name,
            idade: c.age,
            email: c.email,
            telefone: c.phone,
            motivo: c.motivo,
            disponibilidade: c.disp,
            publico: c.publico,
            status: c.status,
            statusDesde,
            recebidoEm: parseData(c.recv, statusDesde),
            risco: !!c.risk,
            terapeutaId: c.ter ? idPorNome.get(c.ter) : null,
            encaminhadoEm: c.ter ? parseData(c.encaminhadoEm, statusDesde) : null,
            termoOk: !!c.termoOk,
            repasseOk: !!c.repasseOk,
            primeiroOk: !!c.primeiroOk,
            motivoDesligamento: c.motivoDeslig,
            termoToken: token(),
          };
        }),
      );
      console.log(`Inseridos ${TERAPEUTAS.length} terapeutas e ${CASOS.length} casos de exemplo.`);
    }
  }

  const email = (process.env.SEED_ADMIN_EMAIL || "equipe@florescer.org").toLowerCase();
  const [existe] = await db.select({ id: schema.usuarios.id }).from(schema.usuarios).where(eq(schema.usuarios.email, email));
  if (existe) {
    console.log(`Usuário ${email} já existe.`);
  } else {
    const senha = process.env.SEED_ADMIN_SENHA || randomBytes(9).toString("base64url");
    await db.insert(schema.usuarios).values({
      id: crypto.randomUUID(),
      nome: process.env.SEED_ADMIN_NOME || "Equipe Florescer",
      email,
      senhaHash: await gerarHash(senha),
      status: "ativo",
      // Em produção, a senha do seed é provisória: o painel pede outra no primeiro acesso.
      trocarSenha: !comExemplos,
    });
    console.log(`\nUsuário criado:\n  e-mail: ${email}\n  senha:  ${senha}\n`);
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
