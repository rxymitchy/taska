/**
 * Adds missing demo speakers and sample checks. Does not wipe accounts.
 * npx tsx scripts/ensure-demo-evaluations.ts
 */
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { demoEvaluations, speakerEmail } from "../lib/demo-evaluations"
import { companyCostPerEvaluation } from "../lib/pricing"

const prisma = new PrismaClient()

const speakers = [
  {
    email: speakerEmail.rita,
    name: "Rita Mwangi",
    country: "Kenya",
    languages: ["Swahili", "English"],
    lightningAddress: "rita@demo.taska",
  },
  {
    email: speakerEmail.chinedu,
    name: "Chinedu Okeke",
    country: "Nigeria",
    languages: ["Yoruba", "Hausa", "English"],
    lightningAddress: "chinedu@demo.taska",
  },
  {
    email: speakerEmail.ama,
    name: "Ama Mensah",
    country: "Ghana",
    languages: ["Twi", "English"],
    lightningAddress: "ama@demo.taska",
  },
]

async function main() {
  const hold = companyCostPerEvaluation()
  const passwordHash = await hash(process.env.DEMO_PASSWORD || "demo1234", 10)

  const companyUser = await prisma.user.findUnique({
    where: { email: "employer@taska.demo" },
    include: { employerProfile: true },
  })
  const company = companyUser?.employerProfile
  if (!company) {
    throw new Error("employer@taska.demo is missing. Run npm run db:seed first.")
  }

  let speakersAdded = 0
  for (const speaker of speakers) {
    const existing = await prisma.user.findUnique({
      where: { email: speaker.email },
      include: { workerProfile: true },
    })
    if (existing?.workerProfile) continue
    if (existing && !existing.workerProfile) {
      throw new Error(`${speaker.email} exists but is not a speaker.`)
    }
    await prisma.user.create({
      data: {
        email: speaker.email,
        passwordHash,
        role: "WORKER",
        workerProfile: {
          create: {
            name: speaker.name,
            country: speaker.country,
            languages: speaker.languages,
            lightningAddress: speaker.lightningAddress,
          },
        },
      },
    })
    speakersAdded += 1
  }

  let added = 0
  for (const sample of demoEvaluations) {
    const existing = await prisma.evaluation.findFirst({
      where: { companyId: company.id, prompt: sample.prompt },
    })
    if (existing) continue

    const speakerUser = await prisma.user.findUnique({
      where: { email: speakerEmail[sample.speaker] },
      include: { workerProfile: true },
    })
    const worker = speakerUser?.workerProfile
    if (!worker) {
      throw new Error(`${speakerEmail[sample.speaker]} is missing.`)
    }

    await prisma.evaluation.create({
      data: {
        companyId: company.id,
        prompt: sample.prompt,
        aiResponse: sample.aiResponse,
        language: sample.language,
        context: sample.context,
        status: "ASSIGNED",
        heldSats: hold,
        assignedWorkerId: worker.id,
        assignedAt: new Date(),
      },
    })
    await prisma.employerProfile.update({
      where: { id: company.id },
      data: { heldSats: { increment: hold } },
    })
    added += 1
  }

  console.log(
    `Speakers added: ${speakersAdded}. Sample checks added: ${added}.`,
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
