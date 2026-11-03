"use client"

import { useState } from "react"
import type { LandingSample } from "@/lib/landing-samples"

export function LandingDemoCard({ sample }: { sample: LandingSample }) {
  const [fixed, setFixed] = useState(false)

  return (
    <div className="landing-demo-card relative w-full">
      <div aria-live="polite" className="rounded-[20px] border border-white/22 bg-[linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-3.5 backdrop-blur-[22px]">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-[3px] text-xs text-white/75">
          {sample.flag} {sample.language} · {sample.place}
        </p>
        <div className="mt-0 max-w-[92%] rounded-[14px] rounded-bl-[6px] bg-white/[0.12] px-3 py-[9px]">
          <p className="text-lg font-semibold text-white">{sample.prompt}</p>
          <p className="mt-1 text-sm text-white/70">{sample.promptEn}</p>
        </div>
        <div
          className={`mt-2 ml-auto max-w-[92%] rounded-[14px] rounded-br-[5px] border p-3 text-ink transition-colors duration-[350ms] ${
            fixed ? "border-[#8fb8a3] bg-[#d3e6da]" : "border-white/20 bg-white"
          }`}
        >
          <p className={`text-xs font-semibold ${fixed ? "text-[#12382b]" : "text-bad"}`}>
            {fixed ? "Sounds local" : "Sounds like a textbook"}
          </p>
          <p className="mt-2 text-[15px] font-semibold">{fixed ? sample.local : sample.textbook}</p>
          <p className="mt-1 text-sm text-muted">{fixed ? sample.localEn : sample.textbookEn}</p>
        </div>
        <div className="mt-2 flex min-h-[38px] flex-wrap items-center justify-between gap-2 text-[13px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/80">{fixed ? "Approved" : "Would a local say this?"}</span>
            {fixed ? (
              <span className="rounded-full bg-[#f0ac6e]/90 px-2 py-0.5 text-xs font-semibold text-[#12382b]">+500 sats</span>
            ) : null}
          </div>
          <button
            className="min-h-[38px] whitespace-nowrap rounded-full bg-[#f7f3e8] px-3.5 py-[7px] text-xs font-semibold text-[#12382b]"
            type="button"
            onClick={() => setFixed((value) => !value)}
          >
            {fixed ? "Reset" : "Fix it"}
          </button>
        </div>
      </div>
    </div>
  )
}
