// Local database for `npm run db`. Leave this process running, then migrate and seed
// from another terminal. Data lives in data/pglite, which is gitignored.
//
// This is PGlite speaking the Postgres wire protocol. The official Postgres
// binaries refuse to start under a Windows administrator account.
// Docker Compose also binds port 5432, so run only one of them.
// Copy the DATABASE_URL this script prints. The pgbouncer and connection_limit
// parameters stop Prisma error 42P05 ("prepared statement already exists").

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { mkdir } from "node:fs/promises";
import path from "path";

const port = Number(process.env.DB_PORT || 5432);
const dataPath = path.join(process.cwd(), "data", "pglite");

await mkdir(dataPath, { recursive: true });

const db = new PGlite(dataPath);
await db.waitReady;

const server = new PGLiteSocketServer({
  db,
  port,
  host: "127.0.0.1",
  maxConnections: 20,
});

await server.start();

console.log(`Postgres-compatible database ready on 127.0.0.1:${port}`);
console.log(
  `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:${port}/postgres?schema=public&pgbouncer=true&connection_limit=1`,
);

async function shutdown() {
  await server.stop();
  await db.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
