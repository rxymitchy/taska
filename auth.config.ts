// Session shape for Auth.js. AUTH_SECRET and AUTH_URL are read from .env.
// Login fails if AUTH_SECRET is missing. trustHost lets http://localhost:3000
// work without listing the host by hand.

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
