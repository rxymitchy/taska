// Session shape for Auth.js. AUTH_SECRET is passed from auth.ts at runtime.
// trustHost lets localhost and the Vercel URL both work.

import type { Role } from "@prisma/client"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = token.role as Role
      }
      return session
    },
  },
} satisfies NextAuthConfig
