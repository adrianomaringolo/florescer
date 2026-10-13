import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida. Copie .env.example para .env.local.");

// Reaproveita a conexão entre recarregamentos do dev server.
const g = globalThis as unknown as { __florescerDb?: ReturnType<typeof criar> };

function criar() {
  const client = postgres(url!, {
    // O pooler do Neon (PgBouncer em modo transação) não suporta prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
  });
  return drizzle(client, { schema });
}

export const db = g.__florescerDb ?? criar();
if (process.env.NODE_ENV !== "production") g.__florescerDb = db;

export { schema };
