// Session shape for Auth.js. AUTH_SECRET is passed from auth.ts at runtime.
// trustHost lets localhost and the Vercel URL both work.

import type { Role } from "@prisma/client"
import type { NextAuthConfig } from "next-auth"

const hour = 60 * 60

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: hour, updateAge: hour },
  jwt: { maxAge: hour },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isAdmin = user.isAdmin
        token.isReviewer = user.isReviewer
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = token.role as Role
        session.user.isAdmin = Boolean(token.isAdmin || token.role === "ADMIN")
        session.user.isReviewer = Boolean(token.isReviewer || token.role === "REVIEWER" || token.role === "ADMIN")
      }
      return session
    },
  },
} satisfies NextAuthConfig
