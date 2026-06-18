import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteWorkout } from "@/lib/actions/workouts";
import { scheduleWorkout } from "@/lib/actions/schedule";
import { todayISO } from "@/lib/dates";
import { timeCapLabel, typeLabel } from "@/lib/format";
import { getActiveProfile, PROFILES } from "@/lib/profiles";
import { getWorkout } from "@/lib/queries";

const SCORE_LABELS: Record<string, string> = {
  time: "Scored by time",
  reps: "Scored by reps",
  rounds: "Scored by rounds + reps",
  weight: "Scored by weight / load",
  none: "",
};

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(Number(id));
  if (!workout) notFound();

  const activeProfile = await getActiveProfile();
  const cap = timeCapLabel(workout.timeCapSeconds);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {typeLabel(workout.type)}
            {cap ? ` · ${cap}` : ""}
            {SCORE_LABELS[workout.scoreType]
              ? ` · ${SCORE_LABELS[workout.scoreType]}`
              : ""}
          </p>
        </div>
        <Link href={`/workouts/${workout.id}/edit`} className="btn-ghost">
          Edit
        </Link>
      </div>

      {workout.prescription && (
        <div className="card">
          <p className="label">Prescription</p>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {workout.prescription}
          </pre>
        </div>
      )}

      {workout.description && (
        <p className="text-sm text-muted">{workout.description}</p>
      )}

      {workout.movements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {workout.movements.map((mv) => (
            <Link
              key={mv.id}
              href={`/workouts?m=${mv.id}`}
              className="chip text-muted"
            >
              {mv.name}
            </Link>
          ))}
        </div>
      )}

      <div className="card">
        <p className="label">Add to a calendar</p>
        <form action={scheduleWorkout} className="space-y-3">
          <input type="hidden" name="workoutId" value={workout.id} />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="profile"
              defaultValue={activeProfile ?? PROFILES[0].id}
              className="input"
            >
              {PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              defaultValue={todayISO()}
              required
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Add to calendar
          </button>
        </form>
      </div>

      <form action={deleteWorkout.bind(null, workout.id)}>
        <button
          type="submit"
          className="text-sm text-muted hover:text-accent"
        >
          Delete workout
        </button>
      </form>
    </div>
  );
}
