import type { Workout } from "@/lib/db/schema";

export const TYPE_LABELS: Record<string, string> = {
  AMRAP: "AMRAP",
  ForTime: "For Time",
  EMOM: "EMOM",
  Strength: "Strength",
  Other: "Other",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function timeCapLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  return `${mins} min cap`;
}

/** A short one-line summary line for a workout card. */
export function workoutMeta(w: Workout): string {
  const parts = [typeLabel(w.type)];
  const cap = timeCapLabel(w.timeCapSeconds);
  if (cap) parts.push(cap);
  return parts.join(" · ");
}
