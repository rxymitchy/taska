import { prisma } from "@/lib/prisma"

export async function refreshWorkerStats(workerId: string) {
  const submissions = await prisma.taskSubmission.findMany({
    where: { workerId },
    select: { status: true, qualityScore: true },
  })
  const reviewed = submissions.filter((submission) => submission.status !== "PENDING")
  const approved = submissions.filter((submission) => submission.status === "APPROVED")
  const scores = approved
    .map((submission) => submission.qualityScore)
    .filter((score): score is number => score != null)
  const approvalRate = reviewed.length === 0 ? 0 : (approved.length / reviewed.length) * 100
  const qualityScore =
    scores.length === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / scores.length

  await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      tasksCompleted: approved.length,
      approvalRate,
      qualityScore,
    },
  })
}
