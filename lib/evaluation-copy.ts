export function yesNo(value: boolean | null) {
  if (value === null) return "—"
  return value ? "Yes" : "No"
}
