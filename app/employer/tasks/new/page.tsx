import type { Metadata } from "next"
import { TaskForm } from "@/components/task-form"
import { Container } from "@/components/ui"

export const metadata: Metadata = { title: "Post a task" }

export default function NewTaskPage() {
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">Post a task</h1>
      <p className="mt-2 text-sm text-muted">
        AI Evaluation tasks can be completed in the product today. Other categories are saved and shown in the marketplace.
      </p>
      <div className="mt-8">
        <TaskForm />
      </div>
    </Container>
  )
}
