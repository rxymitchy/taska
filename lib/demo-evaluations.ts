export const speakerEmail = {
  rita: "rita@taska.demo",
  chinedu: "chinedu@taska.demo",
  ama: "ama@taska.demo",
} as const

export type DemoSpeaker = keyof typeof speakerEmail

export type DemoEvaluation = {
  speaker: DemoSpeaker
  language: string
  place: string
  context: string
  prompt: string
  promptEn: string
  aiResponse: string
  aiResponseEn: string
}

export const demoEvaluations: DemoEvaluation[] = [
  {
    speaker: "rita",
    language: "Swahili",
    place: "Kenya",
    context: "Everyday conversation",
    prompt: "Niaje, uko poa?",
    promptEn: "Hey, you good?",
    aiResponse: "Habari yako? Nina furaha kukuona. Uko vizuri?",
    aiResponseEn: "How are you? I am pleased to see you. Are you well?",
  },
  {
    speaker: "rita",
    language: "Swahili",
    place: "Kenya",
    context: "Kenya / M-Pesa",
    prompt: "Ninaweza kutumia M-Pesa kulipa bili hii?",
    promptEn: "Can I pay this bill with M-Pesa?",
    aiResponse:
      "Ndiyo, unaweza kutumia M-Pesa kulipa bili yako. Chagua Lipa na M-Pesa, kisha Pay Bill, weka nambari ya biashara na nambari ya akaunti iliyo kwenye bili.",
    aiResponseEn: "Yes, you can pay your bill with M-Pesa. Choose Lipa na M-Pesa, then Pay Bill…",
  },
  {
    speaker: "rita",
    language: "Swahili",
    place: "Kenya",
    context: "Kenya / M-Pesa",
    prompt: "Je, naweza kuweka pesa kwenye M-Pesa bila simu?",
    promptEn: "Can I put money on M-Pesa without a phone?",
    aiResponse:
      "Ndiyo. Unaweza kulipa bili hii kwa M-Pesa. Fungua M-Pesa, chagua Lipa na M-Pesa, kisha Pay Bill.",
    aiResponseEn: "Yes. You can pay this bill with M-Pesa. Open M-Pesa, choose Lipa na M-Pesa, then Pay Bill.",
  },
  {
    speaker: "chinedu",
    language: "Yoruba",
    place: "Nigeria",
    context: "Everyday conversation",
    prompt: "Bawo ni, ṣé o wa okay?",
    promptEn: "How far, you good?",
    aiResponse: "Ẹ káàbọ̀. Mo ń inú dídùn láti rí ẹ. Ṣé àlàáfíà ni?",
    aiResponseEn: "Welcome. I am pleased to see you. Are you in good health?",
  },
  {
    speaker: "chinedu",
    language: "Yoruba",
    place: "Nigeria",
    context: "Nigeria / bank transfer",
    prompt: "Ṣé mo lè fi transfer san owó ìwé yìí?",
    promptEn: "Can I pay this school fee by bank transfer?",
    aiResponse: "Bẹẹni. Lo àkọọ́lẹ̀ banki tó wà lórí ìwé náà.",
    aiResponseEn: "Yes. Use the bank details on the bill.",
  },
  {
    speaker: "ama",
    language: "Twi",
    place: "Ghana",
    context: "Everyday conversation",
    prompt: "Ɛte sɛn? Woyɛ okay?",
    promptEn: "How is it? You okay?",
    aiResponse: "Mema wo akye. M’ani agye sɛ mahu wo. Woteɛ?",
    aiResponseEn: "Good morning. I am glad to see you. Are you well?",
  },
  {
    speaker: "ama",
    language: "Twi",
    place: "Ghana",
    context: "Ghana / mobile money",
    prompt: "Metumi de mobile money atua bill yi?",
    promptEn: "Can I pay this bill with mobile money?",
    aiResponse: "Aane. Fa MoMo kɔ merchant number a ɛwɔ bill no so.",
    aiResponseEn: "Yes. Send MoMo to the merchant number on the bill.",
  },
]
