export function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date)
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const avatarColors = ["#1b4332", "#243047", "#5c4a32", "#3d4f46", "#3f3428"]

export function avatarColor(name: string) {
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[index]
}
