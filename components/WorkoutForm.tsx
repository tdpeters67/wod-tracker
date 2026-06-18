"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Movement } from "@/lib/db/schema";
import { SCORE_TYPES, WORKOUT_TYPES } from "@/lib/db/schema";

const SCORE_LABELS: Record<string, string> = {
  time: "Time",
  reps: "Reps",
  rounds: "Rounds + reps",
  weight: "Weight / load",
  none: "No score",
};

const TYPE_LABELS: Record<string, string> = {
  AMRAP: "AMRAP",
  ForTime: "For Time",
  EMOM: "EMOM",
  Strength: "Strength",
  Other: "Other",
};

export type WorkoutFormValues = {
  name: string;
  type: string;
  scoreType: string;
  timeCapMinutes: number | "";
  prescription: string;
  description: string;
  movementIds: number[];
};

export default function WorkoutForm({
  movements,
  action,
  defaults,
  submitLabel,
  cancelHref,
}: {
  movements: Movement[];
  action: (formData: FormData) => void;
  defaults?: Partial<WorkoutFormValues>;
  submitLabel: string;
  cancelHref: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(
    new Set(defaults?.movementIds ?? []),
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = movements.filter((m) =>
      q ? m.name.toLowerCase().includes(q) : true,
    );
    const groups = new Map<string, Movement[]>();
    for (const m of filtered) {
      const key = m.category ?? "Other";
      groups.set(key, [...(groups.get(key) ?? []), m]);
    }
    return [...groups.entries()];
  }, [movements, query]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name}
          placeholder="e.g. Fran"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="type" className="label">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={defaults?.type ?? "Other"}
            className="input"
          >
            {WORKOUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scoreType" className="label">
            Score
          </label>
          <select
            id="scoreType"
            name="scoreType"
            defaultValue={defaults?.scoreType ?? "none"}
            className="input"
          >
            {SCORE_TYPES.map((s) => (
              <option key={s} value={s}>
                {SCORE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="timeCapMinutes" className="label">
          Time cap (minutes, optional)
        </label>
        <input
          id="timeCapMinutes"
          name="timeCapMinutes"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={defaults?.timeCapMinutes}
          placeholder="e.g. 20"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="prescription" className="label">
          Prescription (Rx)
        </label>
        <textarea
          id="prescription"
          name="prescription"
          rows={5}
          defaultValue={defaults?.prescription}
          placeholder={"21-15-9\nThrusters (95/65 lb)\nPull-ups"}
          className="input font-mono"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Notes / description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaults?.description}
          className="input"
        />
      </div>

      <div>
        <span className="label">Movements ({selected.size} selected)</span>
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="movements" value={id} />
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movements…"
          className="input mb-2"
        />
        <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-2 p-3">
          {grouped.length === 0 && (
            <p className="text-sm text-muted">No movements found.</p>
          )}
          {grouped.map(([category, items]) => (
            <div key={category}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((m) => {
                  const on = selected.has(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`chip ${
                        on
                          ? "border-accent text-text"
                          : "text-muted"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
