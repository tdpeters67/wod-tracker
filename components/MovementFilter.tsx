"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Movement } from "@/lib/db/schema";

export default function MovementFilter({
  movements,
  selectedIds,
}: {
  movements: Movement[];
  selectedIds: number[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = new Set(selectedIds);

  function apply(next: Set<number>) {
    const params = new URLSearchParams();
    for (const id of next) params.append("m", String(id));
    const qs = params.toString();
    router.replace(qs ? `/workouts?${qs}` : "/workouts", { scroll: false });
  }

  function toggle(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(next);
  }

  const selectedMovements = movements.filter((m) => selected.has(m.id));

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-sm font-medium"
        >
          Filter by movement {open ? "▲" : "▼"}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => apply(new Set())}
            className="text-sm text-accent"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {!open && selectedMovements.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedMovements.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className="chip border-accent"
            >
              {m.name} ✕
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
          {movements.map((m) => {
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
      )}
      {selected.size > 0 && (
        <p className="mt-2 text-xs text-muted">
          Showing workouts that include all {selected.size} selected movement
          {selected.size > 1 ? "s" : ""}.
        </p>
      )}
    </div>
  );
}
