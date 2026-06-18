import Link from "next/link";
import MovementFilter from "@/components/MovementFilter";
import { workoutMeta } from "@/lib/format";
import { getMovements, getWorkouts } from "@/lib/queries";

function parseIds(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map(Number).filter((n) => Number.isInteger(n) && n > 0);
}

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string | string[] }>;
}) {
  const { m } = await searchParams;
  const selectedIds = parseIds(m);

  const [movements, workouts] = await Promise.all([
    getMovements(),
    getWorkouts(selectedIds),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">WOD Library</h1>
        <Link href="/workouts/new" className="btn-primary">
          + New
        </Link>
      </div>

      <MovementFilter movements={movements} selectedIds={selectedIds} />

      {workouts.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {selectedIds.length > 0
            ? "No workouts match those movements."
            : "No workouts yet. Create your first one."}
        </p>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="card block transition-colors hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{w.name}</span>
                  <span className="text-xs text-muted">
                    {workoutMeta(w)}
                  </span>
                </div>
                {w.movements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {w.movements.map((mv) => (
                      <span
                        key={mv.id}
                        className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted"
                      >
                        {mv.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
