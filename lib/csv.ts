import { contexts, languages } from "@/lib/catalog"
import { MAX_UPLOAD_ROWS } from "@/lib/pricing"

export type UploadRow = {
  prompt: string
  language: (typeof languages)[number]
  context: (typeof contexts)[number]
  aiResponse?: string
}

function matchOption<T extends string>(value: string, options: readonly T[]) {
  const trimmed = value.trim().toLowerCase()
  return options.find((option) => option.toLowerCase() === trimmed) ?? null
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false
  const src = text.replace(/^\uFEFF/, "")
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i += 1
        } else inQuotes = false
      } else cell += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ",") {
      row.push(cell)
      cell = ""
    } else if (ch === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (ch !== "\r") cell += ch
  }
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((entry) => entry.some((value) => value.trim()))
}

function toUploadRow(raw: Record<string, string>, index: number): { row?: UploadRow; error?: string } {
  const prompt = (raw.prompt ?? raw.question ?? "").trim()
  if (prompt.length < 4) return { error: `Row ${index}: add a prompt (4 or more characters).` }
  if (prompt.length > 2000) return { error: `Row ${index}: prompt is too long.` }

  const language = matchOption(raw.language ?? "", languages)
  if (!language) return { error: `Row ${index}: language must be one of ${languages.join(", ")}.` }

  const contextValue = (raw.context ?? "").trim()
  const context = contextValue ? matchOption(contextValue, contexts) : "Everyday conversation"
  if (!context) return { error: `Row ${index}: context must be one of ${contexts.join(", ")}.` }

  const aiResponse = (raw.airesponse ?? raw.ai_response ?? raw.response ?? "").trim()
  if (aiResponse.length > 4000) return { error: `Row ${index}: AI response is too long.` }

  return {
    row: {
      prompt,
      language,
      context,
      aiResponse: aiResponse.length >= 4 ? aiResponse : undefined,
    },
  }
}

export function parseEvaluationUpload(text: string, fileName: string): { rows?: UploadRow[]; error?: string } {
  const trimmed = text.trim()
  if (!trimmed) return { error: "The file is empty." }

  let records: Record<string, string>[] = []
  if (fileName.toLowerCase().endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      return { error: "Could not read that JSON file." }
    }
    const list = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "evaluations" in parsed
      ? (parsed as { evaluations: unknown }).evaluations
      : null
    if (!Array.isArray(list)) return { error: "JSON must be an array of evaluations." }
    records = list.map((item, index) => {
      if (!item || typeof item !== "object") return { prompt: "", _invalid: String(index) }
      const entry = item as Record<string, unknown>
      const out: Record<string, string> = {}
      for (const [key, value] of Object.entries(entry)) {
        out[key.toLowerCase()] = value == null ? "" : String(value)
      }
      return out
    })
  } else {
    const table = parseCsv(trimmed)
    const header = table[0]?.map((cell) => cell.trim().toLowerCase()) ?? []
    if (!header.includes("prompt") && !header.includes("question")) {
      return { error: "CSV needs a prompt column (and language, context)." }
    }
    records = table.slice(1).map((cells) => {
      const out: Record<string, string> = {}
      header.forEach((name, index) => {
        out[name] = cells[index] ?? ""
      })
      return out
    })
  }

  if (records.length === 0) return { error: "No evaluation rows found." }
  if (records.length > MAX_UPLOAD_ROWS) {
    return { error: `Upload at most ${MAX_UPLOAD_ROWS} evaluations at a time.` }
  }

  const rows: UploadRow[] = []
  for (let i = 0; i < records.length; i += 1) {
    const parsed = toUploadRow(records[i], i + 1)
    if (parsed.error) return { error: parsed.error }
    if (parsed.row) rows.push(parsed.row)
  }
  return { rows }
}
