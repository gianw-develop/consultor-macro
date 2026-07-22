const ET_TIME_ZONE = "America/New_York";

function formatEtDateParts(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
}

export function getEtDateKey(date: Date) {
  const parts = formatEtDateParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

export function formatEtDateLabel(date: Date | string) {
  const resolved = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-US", {
    timeZone: ET_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(resolved);
}

export function formatEtTimeLabel(date: Date | string) {
  const resolved = typeof date === "string" ? new Date(date) : date;

  return `${new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(resolved)} ET`;
}

export function getEtWeekdayName(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: ET_TIME_ZONE,
    weekday: "long",
  }).format(date);
}

export function getEtWeekdayIndex(date: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[weekday] ?? -1;
}