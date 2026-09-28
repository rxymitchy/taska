import type { Metadata } from "next"
import type { Prisma } from "@prisma/client"
import { TaskCard } from "@/components/task-card"
import { Container } from "@/components/ui"
import { categories, languages } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"
import { btnSecondary, inputClass, labelClass } from "@/lib/styles"

export const metadata: Metadata = { title: "Tasks" }

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const where: Prisma.TaskWhereInput = {
    status: "FUNDED",
  }
  if (params.category && categories.includes(params.category as (typeof categories)[number])) {
    where.category = params.category
  }
  if (params.language && languages.includes(params.language as (typeof languages)[number])) {
    where.language = params.language
  }
  if (params.reward === "500") where.rewardSats = { gte: 500 }
  if (params.reward === "1000") where.rewardSats = { gte: 1000 }
  if (params.time === "10") where.estimatedMinutes = { lte: 10 }
  if (params.time === "30") where.estimatedMinutes = { lte: 30 }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ taskType: "asc" }, { createdAt: "desc" }],
  })
  const open = tasks.filter((task) => task.completedQuantity < task.quantity)

  return (
    <Container className="py-10">
      <h1 className="text-3xl tracking-tight">Tasks</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Small, clearly defined pieces of digital work. AI response evaluation can be completed and paid in this demo.
      </p>
      <form className="mt-6 grid gap-3 rounded-lg border border-line bg-card p-4 sm:grid-cols-4" method="get">
        <label className="space-y-1">
          <span className={labelClass}>Category</span>
          <select className={inputClass} name="category" defaultValue={params.category ?? ""}>
            <option value="">Any</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Language</span>
          <select className={inputClass} name="language" defaultValue={params.language ?? ""}>
            <option value="">Any</option>
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Reward</span>
          <select className={inputClass} name="reward" defaultValue={params.reward ?? ""}>
            <option value="">Any</option>
            <option value="500">500 sats or more</option>
            <option value="1000">1,000 sats or more</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Estimated time</span>
          <select className={inputClass} name="time" defaultValue={params.time ?? ""}>
            <option value="">Any</option>
            <option value="10">10 minutes or less</option>
            <option value="30">30 minutes or less</option>
          </select>
        </label>
        <div className="sm:col-span-4">
          <button className={btnSecondary} type="submit">
            Apply filters
          </button>
        </div>
      </form>
      {open.length === 0 ? (
        <p className="mt-8 text-muted">No tasks match these filters.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {open.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Container>
  )
}
