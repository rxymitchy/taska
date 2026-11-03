export type LandingSample = {
  flag: string
  language: string
  place: string
  photo: string
  focus: string
  prompt: string
  promptEn: string
  textbook: string
  textbookEn: string
  local: string
  localEn: string
}

export const landingSamples: LandingSample[] = [
  {
    flag: "🇰🇪",
    language: "Swahili",
    place: "Kenya",
    photo: "/images/landing/kenya.jpg",
    focus: "center 20%",
    prompt: "Niaje, uko poa?",
    promptEn: "Hey, you good?",
    textbook: "Habari yako? Nina furaha kukuona. Uko vizuri?",
    textbookEn: "How are you? I am pleased to see you. Are you well?",
    local: "Poa sana! Wewe je?",
    localEn: "Very good! And you?",
  },
  {
    flag: "🇳🇬",
    language: "Yoruba",
    place: "Nigeria",
    photo: "/images/landing/nigeria.jpg",
    focus: "center 16%",
    prompt: "Ṣé mo lè fi transfer san owó ìwé yìí?",
    promptEn: "Can I pay this school fee by bank transfer?",
    textbook: "Bẹẹni. Lo àkọọ́lẹ̀ banki tó wà lórí ìwé náà.",
    textbookEn: "Yes. Use the bank details on the bill.",
    local: "Bẹẹni. Transfer si account ile-iwe to wa lori paper yen.",
    localEn: "Yes. Transfer to the school account on that paper.",
  },
  {
    flag: "🇬🇭",
    language: "Twi",
    place: "Ghana",
    photo: "/images/landing/ghana.jpg",
    focus: "center 52%",
    prompt: "Metumi de mobile money atua bill yi?",
    promptEn: "Can I pay this bill with mobile money?",
    textbook: "Aane. Fa MoMo kɔ merchant number a ɛwɔ bill no so.",
    textbookEn: "Yes. Send MoMo to the merchant number on the bill.",
    local: "Aane. Fa MoMo kɔ merchant number a ɛwɔ bill no so.",
    localEn: "Yes. MoMo it to the merchant number on the bill.",
  },
]

export const howPhotos = [
  "/images/landing/company.jpg",
  "/images/landing/kenya.jpg",
  "/images/landing/review.jpg",
  "/images/landing/hands.jpg",
]
