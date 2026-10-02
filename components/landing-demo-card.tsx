"use client"

import { useState } from "react"

export function LandingDemoCard() {
  const [fixed, setFixed] = useState(false)

  return (
    <div className="landing-demo-card relative mx-auto w-full max-w-[480px] pt-2 pb-7">
      <div aria-live="polite" className="rounded-[20px] border border-white/22 bg-[linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-3.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,.7)] backdrop-blur-[22px]">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-[3px] text-xs text-white/75">🇰🇪 Swahili · Kenya</p>
        <div className="mt-0 max-w-[92%] rounded-[14px] rounded-bl-[6px] bg-white/[0.12] px-3 py-[9px]">
          <p className="text-lg font-semibold text-white">Niaje, uko poa?</p>
          <p className="mt-1 text-sm text-white/70">Hey, you good?</p>
        </div>
        <div className={`mt-2 ml-auto max-w-[92%] rounded-[14px] rounded-br-[5px] border p-3 text-ink transition-colors duration-[350ms] ${fixed ? "border-lime bg-lime" : "border-white/20 bg-white"}`}>
          <p className={`text-xs font-bold ${fixed ? "text-good" : "text-bad"}`}>
            {fixed ? "Sounds local" : "Sounds like a textbook"}
          </p>
          <p className="mt-2 text-[15px] font-semibold">
            {fixed ? "Poa sana! Wewe je?" : "Habari yako? Nina furaha kukuona. Uko vizuri?"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {fixed ? "Very good! And you?" : "How are you? I am pleased to see you. Are you well?"}
          </p>
        </div>
        <div className="mt-2 flex min-h-[38px] flex-wrap items-center justify-between gap-2 text-[13px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/80">{fixed ? "Approved" : "Would a local say this?"}</span>
            {fixed ? <span className="bg-hl text-xs">+500 sats</span> : null}
          </div>
          <button className="[.landing-demo-card_&]:min-h-[38px] [.landing-demo-card_&]:rounded-full [.landing-demo-card_&]:border-2 [.landing-demo-card_&]:border-ink [.landing-demo-card_&]:bg-white [.landing-demo-card_&]:px-3.5 [.landing-demo-card_&]:py-[7px] [.landing-demo-card_&]:text-xs [.landing-demo-card_&]:font-semibold [.landing-demo-card_&]:text-ink [.landing-demo-card_&]:shadow-[3px_3px_0_#0a1a12] [.landing-demo-card_&]:whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#0a1a12]" type="button" onClick={() => setFixed((value) => !value)}>
            {fixed ? "Reset" : "Fix it"}
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-[-24px] rounded-[14px] bg-white px-3 py-2 text-ink shadow-[0_12px_32px_-18px_rgba(0,0,0,.5)] max-[899px]:bottom-[-4px] max-[899px]:left-[10px]">
        <p className="text-[11px] font-medium text-muted">Paid instantly</p>
        <span className="mt-1 inline-flex bg-hl text-xs">⚡ 500 sats</span>
      </div>
    </div>
  )
}