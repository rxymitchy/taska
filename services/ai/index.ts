export type GenerateInput = {
  prompt: string
  language: string
  context: string
}

/**
 * The AI/ML developer owns this function. See docs/team.md.
 *
 * Input: the company prompt, language, and context.
 * Processing: call a model and return its text.
 * Output: the AI response, or null when the company must paste one.
 * Connects beside createEvaluation(). The company form already stores aiResponse.
 * Returning null is the working default, so the evaluation flow does not wait on an API.
 */
export async function generateAiResponse(_input: GenerateInput): Promise<string | null> {
  return null
}
