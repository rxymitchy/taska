"use client"

import { useActionState } from "react"
import { updateProfile, type ProfileState } from "@/app/actions/profile"
import { countries, languages } from "@/lib/catalog"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const initial: ProfileState = { error: "", saved: false }

export function ProfileForm({
  profile,
}: {
  profile: {
    name: string
    country: string
    bio: string
    skills: string[]
    languages: string[]
    githubUrl: string | null
    portfolioUrl: string | null
    lightningAddress: string | null
    cvFileName: string | null
    id: string
  }
}) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Name</span>
        <input className={inputClass} name="name" defaultValue={profile.name} required />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Country</span>
        <select className={inputClass} name="country" defaultValue={profile.country}>
          {countries.map((country) => (
            <option key={country}>{country}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Bio</span>
        <textarea className={inputClass} name="bio" rows={3} defaultValue={profile.bio} />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Skills</span>
        <input className={inputClass} name="skills" defaultValue={profile.skills.join(", ")} placeholder="AI Evaluation, Data Labeling" />
      </label>
      <fieldset className="space-y-2">
        <legend className={labelClass}>Languages</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {languages.map((language) => (
            <label key={language} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="languages"
                value={language}
                defaultChecked={profile.languages.includes(language)}
              />
              {language}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="space-y-1.5">
        <span className={labelClass}>Where you get paid</span>
        <input
          className={inputClass}
          name="lightningAddress"
          defaultValue={profile.lightningAddress ?? ""}
          placeholder="name@wallet.com"
        />
        <span className="text-sm text-muted">Where we send your pay after a check is agreed.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>GitHub</span>
          <input className={inputClass} name="githubUrl" defaultValue={profile.githubUrl ?? ""} placeholder="https://github.com/..." />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Portfolio</span>
          <input className={inputClass} name="portfolioUrl" defaultValue={profile.portfolioUrl ?? ""} placeholder="https://" />
        </label>
      </div>
      <label className="space-y-1.5">
        <span className={labelClass}>CV (PDF, optional)</span>
        <input className={inputClass} name="cv" type="file" accept="application/pdf,.pdf" />
        {profile.cvFileName ? (
          <a className="text-sm text-accent underline" href={`/api/cv/${profile.id}`}>
            CV uploaded
          </a>
        ) : (
          <span className="text-sm text-muted">No CV uploaded.</span>
        )}
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state.saved ? <p className="text-sm text-good">Profile saved.</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  )
}
