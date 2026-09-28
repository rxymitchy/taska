import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import path from "path"

const port = Number(process.env.DB_PORT || 5432)
const db = new PGlite(path.join(process.cwd(), "data", "pglite"))
await db.waitReady

const server = new PGLiteSocketServer({
  db,
  port,
  host: "127.0.0.1",
  maxConnections: 20,
})

await server.start()
console.log(`Postgres-compatible database ready on 127.0.0.1:${port}`)
console.log(
  `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:${port}/postgres?schema=public&pgbouncer=true&connection_limit=1`,
)

async function shutdown() {
  await server.stop()
  await db.close()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
