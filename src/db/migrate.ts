import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Migrações usam a conexão direta (sem pooler) quando disponível — ver README.
const url = process.env.DATABASE_URL_DIRETA || process.env.DATABASE_URL;

async function main() {
  if (!url) throw new Error("DATABASE_URL não definida.");
  const client = postgres(url, { max: 1, onnotice: () => {} });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("Migrações aplicadas.");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
