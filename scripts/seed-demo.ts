/**
 * Demo accounts only. Used on production after migrations.
 * rita@taska.demo (evaluator), worker@taska.demo, employer@taska.demo, admin@taska.demo — password DEMO_PASSWORD or demo1234.
 */
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { companyCostPerEvaluation } from "../lib/pricing"

const prisma = new PrismaClient()

async function main() {
  const hold = companyCostPerEvaluation()
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

  const worker = await prisma.user.create({
    data: {
      email: "rita@taska.demo",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          name: "Rita Mwangi",
          country: "Kenya",
          languages: ["Swahili", "English"],
          lightningAddress: "rita@demo.taska",
        },
      },
    },
    include: { workerProfile: true },
  })
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
        create: { companyName: "Helios AI", prepaidSats: 49286, heldSats: hold },
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

  await prisma.evaluation.create({
    data: {
      companyId: company.employerProfile!.id,
      prompt: "Ninaweza kutumia M-Pesa kulipa bili hii?",
      aiResponse:
        "Ndiyo, unaweza kutumia M-Pesa kulipa bili yako. Chagua Lipa na M-Pesa, kisha Pay Bill, weka nambari ya biashara na nambari ya akaunti iliyo kwenye bili.",
      aiModel: "pasted",
      language: "Swahili",
      context: "Kenya / M-Pesa",
      status: "ASSIGNED",
      heldSats: hold,
      assignedWorkerId: worker.workerProfile!.id,
      assignedAt: new Date(),
    },
  })

  console.log("Seeded demo accounts.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
