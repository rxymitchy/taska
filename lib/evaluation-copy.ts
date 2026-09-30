export function yesNo(value: boolean | null) {
  if (value === null) return "—"
  return value ? "Yes" : "No"
}

export const checkLabels = {
  factuallyCorrect: "True enough to follow",
  languageNatural: "Sounds like people here",
  understandsContext: "Knows how things work here",
} as const
