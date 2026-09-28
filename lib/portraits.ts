const portraits: Record<string, string> = {
  "Rita Mwangi": "/images/rita-mwangi.png",
  "Chinedu Okeke": "/images/chinedu-okeke.png",
  "Thandiwe Nkosi": "/images/thandiwe-nkosi.png",
  "Ama Mensah": "/images/ama-mensah.png",
}

export function portraitFor(name: string) {
  return portraits[name] ?? null
}
