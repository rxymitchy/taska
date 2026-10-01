import { z } from "zod"
import { categories, contexts, countries, languages } from "@/lib/catalog"

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  role: z.enum(["WORKER", "EMPLOYER"]),
  country: z.enum(countries).optional(),
  companyName: z.string().trim().max(120).optional(),
})

const destination = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value.length === 0 ||
      /^ln/i.test(value) ||
      /^[a-zA-Z0-9._~+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    "Enter where you get paid (name@wallet.com)",
  )

export const destinationSchema = destination

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(160),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(16).max(128),
    password: z.string().min(8).max(100),
    confirm: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  })

export const inviteSignupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  invite: z.string().min(16).max(128),
  lightningAddress: destination.optional(),
})

export const taskSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(categories),
  instructions: z.string().trim().min(10).max(4000),
  rewardSats: z.coerce.number().int().min(1).max(1_000_000),
  quantity: z.coerce.number().int().min(1).max(500),
  language: z.enum(languages),
  requiredSkills: z.string().trim().min(2).max(300),
  estimatedMinutes: z.coerce.number().int().min(1).max(240),
})

export const aiEvaluationSchema = z.object({
  prompt: z.string().trim().min(4).max(2000),
  aiResponse: z.string().trim().max(4000).optional(),
  language: z.enum(languages),
  context: z.enum(contexts),
})

export const humanEvaluationSchema = z
  .object({
    evaluationId: z.string().min(1),
    factuallyCorrect: z.enum(["yes", "no"]),
    languageNatural: z.enum(["yes", "no"]),
    understandsContext: z.enum(["yes", "no"]),
    betterAnswer: z.string().trim().max(4000).optional(),
    comment: z.string().trim().max(800).optional(),
  })
  .refine(
    (data) =>
      (data.factuallyCorrect === "yes" && data.languageNatural === "yes" && data.understandsContext === "yes") ||
      (data.betterAnswer?.length ?? 0) >= 4,
    { message: "You answered No, so write a better answer.", path: ["betterAnswer"] },
  )

export const evaluationSchema = z.object({
  taskItemId: z.string().min(1),
  choice: z.enum(["A", "B", "SIMILAR", "NEITHER"]),
  reason: z.string().trim().max(500).optional(),
})

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, "Enter a full URL")

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  country: z.enum(countries),
  bio: z.string().trim().max(600),
  skills: z.string().trim().max(300),
  languages: z.array(z.enum(languages)).min(1),
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  lightningAddress: destination,
})
