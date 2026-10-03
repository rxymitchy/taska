/**
 * Local demo accounts only. Refuses to run against the live database.
 */
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { demoEvaluations, speakerEmail } from "../lib/demo-evaluations"
import { companyCostPerEvaluation } from "../lib/pricing"
import { refuseDemoSeed } from "../lib/demo-accounts"

const prisma = new PrismaClient()

async function main() {
  refuseDemoSeed()
  const hold = companyCostPerEvaluation()
  const held = hold * demoEvaluations.length
  const password = process.env.DEMO_PASSWORD || "demo1234"
  const passwordHash = await hash(password, 10)

  await prisma.creditLedger.deleteMany()
  await prisma.creditDeposit.deleteMany()
  await prisma.reviewerInvite.deleteMany()
  await prisma.evaluationPayout.deleteMany()
  await prisma.evaluationSubmission.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.evaluationBatch.deleteMany()
  await prisma.lightningPayment.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.taskSubmission.deleteMany()
  await prisma.taskItem.deleteMany()
  await prisma.task.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.employerProfile.deleteMany()
  await prisma.user.deleteMany()

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

  const profiles: Record<string, string> = {}
  for (const speaker of speakers) {
    const created = await prisma.user.create({
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
      include: { workerProfile: true },
    })
    profiles[speaker.email] = created.workerProfile!.id
  }

  await prisma.user.create({
    data: {
      email: "worker@taska.demo",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          name: "Amina Wanjiku",
          country: "Kenya",
          languages: ["Swahili", "English"],
          lightningAddress: "amina@demo.taska",
        },
      },
    },
  })
  const company = await prisma.user.create({
    data: {
      email: "employer@taska.demo",
      passwordHash,
      role: "EMPLOYER",
      employerProfile: {
        create: { companyName: "Helios AI", prepaidSats: 49286, heldSats: held },
      },
    },
    include: { employerProfile: true },
  })
  await prisma.user.create({
    data: {
      email: "admin@taska.demo",
      passwordHash,
      role: "ADMIN",
    },
  })

  for (const sample of demoEvaluations) {
    await prisma.evaluation.create({
      data: {
        companyId: company.employerProfile!.id,
        prompt: sample.prompt,
        aiResponse: sample.aiResponse,
        aiModel: "pasted",
        language: sample.language,
        context: sample.context,
        status: "ASSIGNED",
        heldSats: hold,
        assignedWorkerId: profiles[speakerEmail[sample.speaker]],
        assignedAt: new Date(),
      },
    })
  }

  console.log(`Seeded demo accounts and ${demoEvaluations.length} sample checks.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
