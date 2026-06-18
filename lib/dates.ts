/** Date helpers working in terms of local YYYY-MM-DD strings. */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Parse a YYYY-MM-DD string to a Date at local midnight. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/** The 7 ISO dates of the week (Mon–Sun) containing `iso`. */
export function weekOf(iso: string): string[] {
  const date = parseISO(iso);
  const dow = (date.getDay() + 6) % 7; // 0 = Monday
  const monday = addDays(iso, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function dayName(iso: string): string {
  return DAY_NAMES[parseISO(iso).getDay()];
}

/** e.g. "Jun 18". */
export function formatShort(iso: string): string {
  const date = parseISO(iso);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. "Wed, Jun 18". */
export function formatHuman(iso: string): string {
  return `${dayName(iso)}, ${formatShort(iso)}`;
}
