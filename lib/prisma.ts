// One Prisma client for the app. In development it is kept on globalThis so
// a hot reload does not open another pool. With `npm run db` and Neon pooled
// URLs, pgbouncer=true and connection_limit=1 stop prepared-statement errors.

import { PrismaClient } from "@prisma/client"

function databaseUrl() {
  let url = process.env.DATABASE_URL
  if (!url) return url
  if (!url.includes("pgbouncer=")) url += `${url.includes("?") ? "&" : "?"}pgbouncer=true`
  if (!url.includes("connection_limit=")) url += `${url.includes("?") ? "&" : "?"}connection_limit=1`
  return url
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const datasourceUrl = databaseUrl()
export const prisma =
  globalForPrisma.prisma ??
  (datasourceUrl
    ? new PrismaClient({ datasources: { db: { url: datasourceUrl } } })
    : new PrismaClient())

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
