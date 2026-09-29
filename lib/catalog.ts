export const countries = [
  "Kenya",
  "Nigeria",
  "Ghana",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "South Africa",
  "Zambia",
  "Zimbabwe",
  "Ethiopia",
  "Senegal",
  "Cameroon",
] as const

export const languages = [
  "English",
  "Swahili",
  "French",
  "Hausa",
  "Yoruba",
  "Amharic",
  "Arabic",
  "Kinyarwanda",
  "Zulu",
  "Wolof",
  "Twi",
  "Afrikaans",
] as const

export const contexts = [
  "Kenya / M-Pesa",
  "Nigeria / bank transfer",
  "Ghana / mobile money",
  "Everyday conversation",
] as const

export const categories = [
  "AI Evaluation",
  "Data Labeling",
  "Transcription",
  "Research",
  "Content Verification",
] as const

export type Country = (typeof countries)[number]
export type Language = (typeof languages)[number]
export type Category = (typeof categories)[number]
export type ContextLabel = (typeof contexts)[number]
