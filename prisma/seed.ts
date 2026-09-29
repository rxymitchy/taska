// Demo data for `npm run db:seed`. Run it after migrations, with the database up.
// It deletes users, tasks, and payments, then recreates them. Do not run it
// against a database you need to keep.
// Password comes from DEMO_PASSWORD (default demo1234):
// worker@taska.demo, employer@taska.demo, admin@taska.demo.
// The .env loader below is here because the Prisma seed process does not always
// put those variables in the environment before this file runs.

import { readFileSync } from "fs"
import { PrismaClient, type Task } from "@prisma/client"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { evaluationBank } from "../lib/evaluation-bank"
import { refreshWorkerStats } from "../services/stats"

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
  if (match && process.env[match[1]] == null) process.env[match[1]] = match[2]
}

const prisma = new PrismaClient()

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

const workerSeeds = [
  {
    email: "rita@taska.demo",
    name: "Rita Mwangi",
    country: "Kenya",
    bio: "Reviews assistant answers and labels datasets. Previously taught secondary-school computer studies in Kisumu.",
    skills: ["AI Evaluation", "Python", "Data Labeling"],
    languages: ["English", "Swahili"],
    days: 140,
    approved: 46,
    rejected: 2,
  },
  {
    email: "chinedu@taska.demo",
    name: "Chinedu Okeke",
    country: "Nigeria",
    bio: "Checks product data and local-language answers for teams shipping in West Africa.",
    skills: ["Data Labeling", "Research", "AI Evaluation"],
    languages: ["English", "Hausa", "Yoruba"],
    days: 120,
    approved: 22,
    rejected: 1,
  },
  {
    email: "ama@taska.demo",
    name: "Ama Mensah",
    country: "Ghana",
    bio: "Transcribes interviews and verifies short public listings.",
    skills: ["Transcription", "Content Verification"],
    languages: ["English", "Twi"],
    days: 100,
    approved: 18,
    rejected: 0,
  },
  {
    email: "rebecca@taska.demo",
    name: "Rebecca Nakato",
    country: "Uganda",
    bio: "Does short research tasks and bilingual review.",
    skills: ["Research", "AI Evaluation"],
    languages: ["English", "Swahili"],
    days: 90,
    approved: 15,
    rejected: 1,
  },
  {
    email: "jeanpierre@taska.demo",
    name: "Jean-Pierre Habimana",
    country: "Rwanda",
    bio: "French and English evaluation for support and education content.",
    skills: ["AI Evaluation", "Transcription"],
    languages: ["French", "English", "Kinyarwanda"],
    days: 80,
    approved: 12,
    rejected: 0,
  },
  {
    email: "thandiwe@taska.demo",
    name: "Thandiwe Nkosi",
    country: "South Africa",
    bio: "Verifies content and gathers local context for research briefs.",
    skills: ["Content Verification", "Research"],
    languages: ["English", "Zulu"],
    days: 70,
    approved: 19,
    rejected: 1,
  },
  {
    email: "fatou@taska.demo",
    name: "Fatou Diop",
    country: "Senegal",
    bio: "French-language review and short transcription.",
    skills: ["AI Evaluation", "Transcription"],
    languages: ["French", "Wolof"],
    days: 60,
    approved: 9,
    rejected: 0,
  },
  {
    email: "yonas@taska.demo",
    name: "Yonas Bekele",
    country: "Ethiopia",
    bio: "Amharic and English checks for public-information tasks.",
    skills: ["AI Evaluation", "Research"],
    languages: ["Amharic", "English"],
    days: 50,
    approved: 11,
    rejected: 0,
  },
  {
    email: "worker@taska.demo",
    name: "Amina Wanjiku",
    country: "Kenya",
    bio: "Completing AI evaluation and labeling tasks, and building a record from approved work.",
    skills: ["AI Evaluation", "Data Labeling"],
    languages: ["English", "Swahili"],
    days: 18,
    approved: 0,
    rejected: 0,
  },
]

async function recordOutcome(input: {
  workerId: string
  taskId: string
  taskItemId?: string
  destination: string
  amount: number
  status: "APPROVED" | "REJECTED" | "PENDING"
  score?: number
  days: number
  answers: object
}) {
  const when = daysAgo(input.days)
  if (input.taskItemId) {
    await prisma.taskItem.update({
      where: { id: input.taskItemId },
      data: {
        status: "SUBMITTED",
        assignedWorkerId: input.workerId,
        assignedAt: when,
      },
    })
  }
  const submission = await prisma.taskSubmission.create({
    data: {
      workerId: input.workerId,
      taskId: input.taskId,
      taskItemId: input.taskItemId,
      status: input.status,
      qualityScore: input.score ?? null,
      answers: input.answers,
      submittedAt: when,
      reviewedAt: input.status === "PENDING" ? null : when,
    },
  })
  if (input.status !== "APPROVED") return
  const paymentHash = randomBytes(32).toString("hex")
  await prisma.payment.create({
    data: {
      workerId: input.workerId,
      submissionId: submission.id,
      amountSats: input.amount,
      paymentMethod: "LIGHTNING",
      paymentReference: paymentHash,
      status: "SENT",
      createdAt: when,
      lightningPayment: {
        create: {
          invoice: `lnmock1${input.amount}s${paymentHash.slice(0, 24)}`,
          paymentHash,
          destination: input.destination,
          amountSats: input.amount,
          status: "PAID",
          createdAt: when,
        },
      },
    },
  })
}

async function main() {
  await prisma.evaluationPayout.deleteMany()
  await prisma.evaluationSubmission.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.lightningPayment.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.taskSubmission.deleteMany()
  await prisma.taskItem.deleteMany()
  await prisma.task.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.employerProfile.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash(process.env.DEMO_PASSWORD || "demo1234", 10)
  const employer = await prisma.user.create({
    data: {
      email: "employer@taska.demo",
      passwordHash,
      role: "EMPLOYER",
      createdAt: daysAgo(80),
      employerProfile: {
        create: {
          companyName: "Helios AI",
          companyDescription: "A research team checking assistant quality before models ship.",
          createdAt: daysAgo(80),
        },
      },
    },
    include: { employerProfile: true },
  })
  await prisma.user.create({
    data: {
      email: "admin@taska.demo",
      passwordHash,
      role: "ADMIN",
      createdAt: daysAgo(90),
    },
  })

  const profiles = []
  for (const worker of workerSeeds) {
    const slug = worker.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")
    const created = await prisma.user.create({
      data: {
        email: worker.email,
        passwordHash,
        role: "WORKER",
        createdAt: daysAgo(worker.days),
        workerProfile: {
          create: {
            name: worker.name,
            country: worker.country,
            bio: worker.bio,
            skills: worker.skills,
            languages: worker.languages,
            githubUrl: `https://github.com/${slug}-taska`,
            lightningAddress: `${slug}@demo.taska`,
            createdAt: daysAgo(worker.days),
          },
        },
      },
      include: { workerProfile: true },
    })
    profiles.push({ ...worker, id: created.workerProfile!.id, destination: `${slug}@demo.taska` })
  }

  const employerId = employer.employerProfile!.id
  const byEmail = Object.fromEntries(profiles.map((profile) => [profile.email, profile]))

  const archive = await prisma.task.create({
    data: {
      employerId,
      title: "Earlier evaluation batches",
      description: "Closed work used to show verified history.",
      category: "AI Evaluation",
      instructions: "Historical task. Not open for new submissions.",
      rewardSats: 500,
      quantity: 400,
      language: "English",
      requiredSkills: ["English comprehension"],
      estimatedMinutes: 5,
      status: "CLOSED",
      taskType: "GENERIC",
      createdAt: daysAgo(100),
    },
  })

  const label = await openTask(employerId, {
    title: "Label product photos",
    description: "Mark whether a product photo matches the title and category.",
    category: "Data Labeling",
    instructions: "Look at the photo description and choose the closest category.",
    rewardSats: 800,
    quantity: 40,
    language: "English",
    requiredSkills: ["Attention to detail"],
    estimatedMinutes: 4,
    createdAt: daysAgo(9),
  })
  const transcribe = await openTask(employerId, {
    title: "Transcribe interview clips",
    description: "Write down a one-minute interview clip in French.",
    category: "Transcription",
    instructions: "Transcribe the words you hear. Mark unclear audio in brackets.",
    rewardSats: 1200,
    quantity: 15,
    language: "French",
    requiredSkills: ["French listening"],
    estimatedMinutes: 12,
    createdAt: daysAgo(8),
  })
  const verify = await openTask(employerId, {
    title: "Verify local business listings",
    description: "Check that a business name, area, and opening claim match a public source.",
    category: "Content Verification",
    instructions: "Confirm the listing against a public page or sign and note what matched.",
    rewardSats: 600,
    quantity: 25,
    language: "English",
    requiredSkills: ["Local research"],
    estimatedMinutes: 8,
    createdAt: daysAgo(7),
  })
  await openTask(employerId, {
    title: "Compare translated health answers",
    description: "Read a short health question and two translations. This batch is visible, and submission opens with the evaluation task.",
    category: "AI Evaluation",
    instructions: "Prefer the translation that keeps the meaning and is safe.",
    rewardSats: 700,
    quantity: 16,
    language: "Hausa",
    requiredSkills: ["Hausa"],
    estimatedMinutes: 6,
    createdAt: daysAgo(6),
  })
  await openTask(employerId, {
    title: "Check market prices",
    description: "Record the current price of a common household item from a local source.",
    category: "Research",
    instructions: "Note the item, price, place, and date.",
    rewardSats: 900,
    quantity: 12,
    language: "English",
    requiredSkills: ["Local research"],
    estimatedMinutes: 15,
    createdAt: daysAgo(5),
  })
  await openTask(employerId, {
    title: "Swahili transcript review",
    description: "Read a short transcript and mark words that were heard incorrectly.",
    category: "Transcription",
    instructions: "Correct obvious recognition errors. Leave names as spoken.",
    rewardSats: 1000,
    quantity: 10,
    language: "Swahili",
    requiredSkills: ["Swahili"],
    estimatedMinutes: 10,
    createdAt: daysAgo(4),
  })

  const hero = await prisma.task.create({
    data: {
      employerId,
      title: "Evaluate AI Responses",
      description:
        "Read the user's question and compare Response A and Response B. Select the response that is more helpful, accurate and relevant.",
      category: "AI Evaluation",
      instructions:
        "Read the question. Compare the two responses. Choose Response A, Response B, both are similar, or neither is acceptable. Add a short reason if you want.",
      rewardSats: 500,
      quantity: 20,
      language: "English",
      requiredSkills: ["English comprehension"],
      estimatedMinutes: 5,
      status: "FUNDED",
      taskType: "AI_RESPONSE_EVALUATION",
      autoApprove: true,
      createdAt: daysAgo(2),
      items: {
        create: evaluationBank.slice(0, 12).concat(evaluationBank.slice(0, 8)).map((item) => ({
          prompt: item.prompt,
          responseA: item.responseA,
          responseB: item.responseB,
          referenceChoice: item.referenceChoice,
        })),
      },
    },
    include: { items: true },
  })

  const heroWorkers = [
    "worker@taska.demo",
    "worker@taska.demo",
    "rita@taska.demo",
    "chinedu@taska.demo",
    "ama@taska.demo",
    "rebecca@taska.demo",
    "jeanpierre@taska.demo",
    "thandiwe@taska.demo",
  ]
  for (let index = 0; index < heroWorkers.length; index += 1) {
    const person = byEmail[heroWorkers[index]]
    const item = hero.items[index]
    await recordOutcome({
      workerId: person.id,
      taskId: hero.id,
      taskItemId: item.id,
      destination: person.destination,
      amount: 500,
      status: "APPROVED",
      score: 90 + (index % 8),
      days: 6 - (index % 5),
      answers: { choice: item.referenceChoice ?? "A", reason: "Clearer and more careful." },
    })
  }

  const amina = byEmail["worker@taska.demo"]
  await recordOutcome({
    workerId: amina.id,
    taskId: label.id,
    destination: amina.destination,
    amount: 800,
    status: "APPROVED",
    score: 92,
    days: 4,
    answers: { notes: "Photo matches the listed category." },
  })
  await recordOutcome({
    workerId: amina.id,
    taskId: transcribe.id,
    destination: amina.destination,
    amount: 1200,
    status: "APPROVED",
    score: 95,
    days: 3,
    answers: { notes: "Transcript completed with one unclear name marked." },
  })

  for (const person of profiles) {
    for (let index = 0; index < person.approved; index += 1) {
      await recordOutcome({
        workerId: person.id,
        taskId: archive.id,
        destination: person.destination,
        amount: 500,
        status: "APPROVED",
        score: 88 + (index % 10),
        days: 20 + (index % 30),
        answers: { choice: "A", reason: "Preferred the more accurate response." },
      })
    }
    for (let index = 0; index < person.rejected; index += 1) {
      await recordOutcome({
        workerId: person.id,
        taskId: archive.id,
        destination: person.destination,
        amount: 500,
        status: "REJECTED",
        days: 15,
        answers: { choice: "B", reason: "Too vague to use." },
      })
    }
  }

  await recordOutcome({
    workerId: byEmail["chinedu@taska.demo"].id,
    taskId: verify.id,
    destination: byEmail["chinedu@taska.demo"].destination,
    amount: 600,
    status: "PENDING",
    days: 1,
    answers: {
      notes: "The pharmacy is on the stated street and the Saturday hours match the sign.",
    },
  })

  const counts = await prisma.taskSubmission.groupBy({
    by: ["taskId"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  })
  for (const row of counts) {
    const task = await prisma.task.findUnique({ where: { id: row.taskId } })
    if (!task) continue
    const completed = row._count._all
    await prisma.task.update({
      where: { id: task.id },
      data: {
        completedQuantity: completed,
        status: task.status === "CLOSED" || completed >= task.quantity ? "CLOSED" : "FUNDED",
      },
    })
  }

  for (const person of profiles) {
    await refreshWorkerStats(person.id)
  }

  await prisma.evaluation.create({
    data: {
      companyId: employerId,
      prompt: "Ninaweza kutumia M-Pesa kulipa bili hii?",
      aiResponse:
        "Ndiyo, unaweza kutumia M-Pesa kulipa bili yako. Chagua Lipa na M-Pesa, kisha Pay Bill, weka nambari ya biashara na nambari ya akaunti iliyo kwenye bili.",
      language: "Swahili",
      context: "Kenya / M-Pesa",
      status: "ASSIGNED",
      assignedWorkerId: amina.id,
      assignedAt: daysAgo(0),
    },
  })
}

function openTask(
  employerId: string,
  data: Pick<
    Task,
    | "title"
    | "description"
    | "category"
    | "instructions"
    | "rewardSats"
    | "quantity"
    | "language"
    | "estimatedMinutes"
  > & { requiredSkills: string[]; createdAt: Date },
) {
  return prisma.task.create({
    data: {
      employerId,
      ...data,
      status: "FUNDED",
      taskType: "GENERIC",
      autoApprove: false,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
