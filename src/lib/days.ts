// dayOfWeek: 0 = Sunday .. 6 = Saturday (matches JS Date#getDay / getUTCDay)
export const WEEKDAY_LABELS_ZH = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

// Treats `dateStr` ("YYYY-MM-DD") as a plain Taiwan calendar date and
// returns its day of week — no timezone conversion needed since the whole
// app only ever deals in Taiwan-local calendar dates for day-of-week purposes.
export function dayOfWeekForDateString(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function todayDateStringInTaiwan(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}
