import { createMovement, deleteMovement } from "@/lib/actions/movements";
import { getMovements } from "@/lib/queries";

export default async function MovementsPage() {
  const movements = await getMovements();

  const byCategory = new Map<string, typeof movements>();
  for (const m of movements) {
    const key = m.category ?? "Other";
    byCategory.set(key, [...(byCategory.get(key) ?? []), m]);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Movements</h1>

      <div className="card">
        <p className="label">Add a movement</p>
        <form action={createMovement} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            required
            placeholder="Name (e.g. Wall Walk)"
            className="input"
          />
          <input
            name="category"
            placeholder="Category (optional)"
            className="input sm:max-w-44"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </div>

      {[...byCategory.entries()].map(([category, items]) => (
        <div key={category}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {category}
          </p>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {items.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between bg-surface px-4 py-2.5"
              >
                <span>{m.name}</span>
                <form action={deleteMovement.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="text-sm text-muted hover:text-accent"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
