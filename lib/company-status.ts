/** One status a company sees. Internal steps stay hidden. */
export function companyStatus(status: string) {
  if (status === "COMPLETED" || status === "APPROVED") {
    return { status: "COMPLETED", label: "Done" }
  }
  if (status === "UNDER_REVIEW" || status === "WORKER_COMPLETED") {
    return { status: "UNDER_REVIEW", label: "Checking" }
  }
  if (status === "ASSIGNED") {
    return { status: "ASSIGNED", label: "In progress" }
  }
  if (status === "REJECTED") {
    return { status: "REJECTED", label: "Sent back" }
  }
  return { status: "PENDING", label: "Waiting" }
}

export function companyStatusOpen(status: string) {
  return status !== "COMPLETED" && status !== "APPROVED"
}
