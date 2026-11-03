import type { Metadata } from "next"
import { TaskForm } from "@/components/task-form"
import { Container, PageHeader } from "@/components/ui"

export const metadata: Metadata = { title: "Post a task" }

export default function NewTaskPage() {
  return (
    <Container className="page-frame max-w-2xl!">
      <PageHeader
        title="Post a task"
        description="AI Evaluation tasks can be completed in the product today. Other categories are saved and shown in the marketplace."
      />
      <div className="form-surface mt-10">
        <TaskForm />
      </div>
    </Container>
  )
}
