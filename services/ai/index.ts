export type GenerateInput = {
  prompt: string
  language: string
  context: string
}

export type GeneratedResponse = {
  text: string
  model: string
}

const TIMEOUT_MS = 12_000

function localDemoResponse(input: GenerateInput): GeneratedResponse {
  const { prompt, language, context } = input
  if (language === "Swahili" && context.includes("M-Pesa")) {
    return {
      model: "taska-local",
      text: `Ndiyo. Unaweza kulipa bili hii kwa M-Pesa. Fungua M-Pesa, chagua Lipa na M-Pesa, kisha Pay Bill. Weka nambari ya biashara na nambari ya akaunti iliyo kwenye bili, kisha kiasi, na thibitisha.\n\n(Question: ${prompt})`,
    }
  }
  if (language === "Swahili") {
    return {
      model: "taska-local",
      text: `Ndiyo, ninaweza kusaidia. ${prompt}\n\nJibu hili linahitaji muktadha wa ${context}. Fuata hatua za kawaida katika nchi yako.`,
    }
  }
  if (language === "Yoruba") {
    return {
      model: "taska-local",
      text: `Bẹẹni. ${prompt}\n\nJẹ́ kí o tẹ̀lé ìtọ́sọ́nà tó wọ́pọ̀ fún ${context}.`,
    }
  }
  if (language === "Twi") {
    return {
      model: "taska-local",
      text: `Aane. ${prompt}\n\nFa ${context} kwan a ɛtaa yɛ no so.`,
    }
  }
  if (language === "Hausa") {
    return {
      model: "taska-local",
      text: `Eh. ${prompt}\n\nBi hanyar da aka saba da ita don ${context}.`,
    }
  }
  return {
    model: "taska-local",
    text: `Yes. ${prompt}\n\nFollow the usual steps for ${context} in ${language}.`,
  }
}

async function generateFromApi(input: GenerateInput): Promise<GeneratedResponse | null> {
  const apiKey = process.env.AI_API_KEY?.trim()
  if (!apiKey) return null

  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "")
  const model = process.env.AI_MODEL || "gpt-4o-mini"
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You answer as a helpful local assistant. Reply only in ${input.language}. Use everyday wording for ${input.context}. Do not mention that you are an AI.`,
          },
          { role: "user", content: input.prompt },
        ],
      }),
    })
    if (!response.ok) return null
    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] }
    const text = body.choices?.[0]?.message?.content?.trim()
    if (!text) return null
    return { text: text.slice(0, 4000), model }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Builds the AI answer stored on an evaluation.
 *
 * Input: prompt, language, context.
 * Processing: call AI_API_KEY / AI_BASE_URL if set; otherwise a local demo reply.
 * Output: { text, model }, or null only if both paths fail.
 * Connects at createEvaluation() when the company leaves the response blank.
 */
export async function generateAiResponse(input: GenerateInput): Promise<GeneratedResponse | null> {
  const fromApi = await generateFromApi(input)
  if (fromApi) return fromApi
  return localDemoResponse(input)
}
