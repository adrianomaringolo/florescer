import type { Config } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sem .env.local: usa as variáveis do ambiente (ex.: CI).
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrações usam a conexão direta (sem pooler) quando disponível.
    url: process.env.DATABASE_URL_DIRETA || process.env.DATABASE_URL!,
  },
} satisfies Config;
