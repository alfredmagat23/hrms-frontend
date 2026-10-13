/** Demo dates use YYYY-MM-DD strings in Asia/Manila calendar days. */

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function todayIso(): string {
  return formatDate(new Date());
}

export function weekday(iso: string): number {
  return parseDate(iso).getDay();
}

export function isWeekend(iso: string): boolean {
  const day = weekday(iso);
  return day === 0 || day === 6;
}

export function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function minutesBetween(startHhMm: string, endHhMm: string): number {
  const [sh, sm] = startHhMm.split(":").map(Number);
  const [eh, em] = endHhMm.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatHhMm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Relative weekday helpers for seed data that stays current. */
export function mondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diff);
  return formatDate(now);
}

export function relativeWeekday(weeksAgo: number, weekdayIndex: number): string {
  const monday = parseDate(mondayOfCurrentWeek());
  monday.setDate(monday.getDate() - weeksAgo * 7 + (weekdayIndex - 1));
  return formatDate(monday);
}
