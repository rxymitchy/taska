"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { parseEvaluationUpload } from "@/lib/csv"
import { holdCompanyCredits } from "@/lib/credits"
import { companyCostPerEvaluation } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { generateAiResponse } from "@/services/ai"
import { assignEvaluation } from "@/services/assignment"

export async function uploadEvaluations(_prev: { error: string }, formData: FormData) {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return { error: "Company profile not found." }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV or JSON file." }
  if (file.size > 2_000_000) return { error: "File is too large (2 MB max)." }

  const text = await file.text()
  const parsed = parseEvaluationUpload(text, file.name)
  if (parsed.error || !parsed.rows) return { error: parsed.error ?? "Could not read that file." }

  const rows = []
  for (const row of parsed.rows) {
    let aiResponse = row.aiResponse ?? ""
    let aiModel = "pasted"
    if (aiResponse.length < 4) {
      const generated = await generateAiResponse({
        prompt: row.prompt,
        language: row.language,
        context: row.context,
      })
      if (!generated?.text) return { error: `Could not generate a response for: ${row.prompt}` }
      aiResponse = generated.text
      aiModel = generated.model
    }
    rows.push({ ...row, aiResponse, aiModel })
  }

  const held = await holdCompanyCredits(company.id, rows.length, `Upload ${file.name}`)
  if ("error" in held && held.error) return { error: held.error }

  const unit = companyCostPerEvaluation()
  const batch = await prisma.evaluationBatch.create({
    data: {
      companyId: company.id,
      fileName: file.name.slice(0, 180),
      rowCount: rows.length,
    },
  })

  const createdIds: string[] = []
  for (const row of rows) {
    const evaluation = await prisma.evaluation.create({
      data: {
        companyId: company.id,
        batchId: batch.id,
        prompt: row.prompt,
        aiResponse: row.aiResponse,
        aiModel: row.aiModel,
        language: row.language,
        context: row.context,
        status: "PENDING",
        heldSats: unit,
      },
    })
    createdIds.push(evaluation.id)
  }

  for (const id of createdIds) {
    await assignEvaluation(id)
  }

  revalidatePath("/employer")
  revalidatePath("/dashboard")
  redirect("/employer")
}
