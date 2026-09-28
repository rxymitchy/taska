"use client"

import { useActionState } from "react"
import { createTask } from "@/app/actions/tasks"
import { categories, languages } from "@/lib/catalog"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

export function TaskForm() {
  const [state, action, pending] = useActionState(createTask, { error: "" })
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Title</span>
        <input className={inputClass} name="title" required placeholder="Evaluate AI Responses" />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Description</span>
        <textarea className={inputClass} name="description" rows={3} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>Category</span>
          <select className={inputClass} name="category" defaultValue="AI Evaluation">
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Language</span>
          <select className={inputClass} name="language" defaultValue="English">
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-1.5">
        <span className={labelClass}>Instructions</span>
        <textarea className={inputClass} name="instructions" rows={4} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className={labelClass}>Reward (sats)</span>
          <input className={inputClass} name="rewardSats" type="number" min={1} defaultValue={500} required />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Number of tasks</span>
          <input className={inputClass} name="quantity" type="number" min={1} defaultValue={20} required />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Minutes</span>
          <input className={inputClass} name="estimatedMinutes" type="number" min={1} defaultValue={5} required />
        </label>
      </div>
      <label className="space-y-1.5">
        <span className={labelClass}>Required skills</span>
        <input className={inputClass} name="requiredSkills" placeholder="English comprehension" required />
      </label>
      <p className="text-sm text-muted">
        Posting funds the task budget for the demo. Taska does not hold the money. Approved work is paid to workers over Lightning.
      </p>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Posting…" : "Post task"}
      </button>
    </form>
  )
}
