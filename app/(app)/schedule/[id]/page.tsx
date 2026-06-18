import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  deleteResult,
  saveResult,
  unscheduleWorkout,
} from "@/lib/actions/schedule";
import { formatHuman } from "@/lib/dates";
import { timeCapLabel, typeLabel } from "@/lib/format";
import { getActiveProfile } from "@/lib/profiles";
import { getScheduledEntry } from "@/lib/queries";

const SCORE_PLACEHOLDER: Record<string, string> = {
  time: "e.g. 3:21",
  reps: "e.g. 142 reps",
  rounds: "e.g. 5 rounds + 8",
  weight: "e.g. 185 lb",
  none: "Optional",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getActiveProfile();
  if (!profile) redirect("/");

  const { id } = await params;
  const entry = await getScheduledEntry(Number(id), profile);
  if (!entry) notFound();

  const { workout, result, date, scheduledId } = entry;
  const cap = timeCapLabel(workout.timeCapSeconds);
  // Pre-fill the "performed" box from the prescription on first log.
  const performedDefault = result?.performed ?? workout.prescription ?? "";

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/schedule?d=${date}`}
          className="text-sm text-muted"
        >
          ← {formatHuman(date)}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{workout.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {typeLabel(workout.type)}
          {cap ? ` · ${cap}` : ""}
        </p>
      </div>

      {workout.prescription && (
        <div className="card">
          <p className="label">Prescribed (Rx)</p>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {workout.prescription}
          </pre>
        </div>
      )}

      <form
        action={saveResult.bind(null, scheduledId, date)}
        className="card space-y-4"
      >
        <p className="label">What you actually did</p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="rx"
            defaultChecked={result?.rx ?? false}
            className="size-4 accent-accent"
          />
          Done as prescribed (Rx)
        </label>

        <div>
          <label htmlFor="performed" className="label">
            Scaled / actual version
          </label>
          <textarea
            id="performed"
            name="performed"
            rows={5}
            defaultValue={performedDefault}
            className="input font-mono"
          />
        </div>

        {workout.scoreType !== "none" && (
          <div>
            <label htmlFor="score" className="label">
              Score
            </label>
            <input
              id="score"
              name="score"
              defaultValue={result?.score ?? ""}
              placeholder={SCORE_PLACEHOLDER[workout.scoreType]}
              className="input"
            />
          </div>
        )}

        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={result?.notes ?? ""}
            placeholder="How it felt, scaling reasons, etc."
            className="input"
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          {result ? "Update result" : "Save result"}
        </button>
      </form>

      <div className="flex items-center justify-between">
        {result ? (
          <form action={deleteResult.bind(null, scheduledId, date)}>
            <button
              type="submit"
              className="text-sm text-muted hover:text-accent"
            >
              Clear result
            </button>
          </form>
        ) : (
          <span />
        )}
        <form action={unscheduleWorkout.bind(null, scheduledId, date)}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-accent"
          >
            Remove from calendar
          </button>
        </form>
      </div>
    </div>
  );
}
