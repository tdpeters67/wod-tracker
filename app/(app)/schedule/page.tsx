import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addDays,
  dayName,
  formatShort,
  parseISO,
  todayISO,
  weekOf,
} from "@/lib/dates";
import { getActiveProfile, profileName } from "@/lib/profiles";
import { getSchedule, type ScheduledEntry } from "@/lib/queries";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const profile = await getActiveProfile();
  if (!profile) redirect("/");

  const { d } = await searchParams;
  const focus = d && ISO_DATE.test(d) ? d : todayISO();
  const today = todayISO();

  const week = weekOf(focus);
  const entries = await getSchedule(profile, week[0], week[6]);

  const byDate = new Map<string, ScheduledEntry[]>();
  for (const e of entries) {
    byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  }

  const monthLabel = `${formatShort(week[0])} – ${formatShort(week[6])}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{profileName(profile)}</h1>
        <Link href="/workouts" className="btn-primary">
          + Add WOD
        </Link>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link href={`/schedule?d=${addDays(focus, -7)}`} className="btn-ghost">
          ← Prev
        </Link>
        <div className="text-center">
          <div className="font-medium">{monthLabel}</div>
          <Link href={`/schedule?d=${today}`} className="text-accent">
            Today
          </Link>
        </div>
        <Link href={`/schedule?d=${addDays(focus, 7)}`} className="btn-ghost">
          Next →
        </Link>
      </div>

      <ul className="space-y-2">
        {week.map((date) => {
          const dayEntries = byDate.get(date) ?? [];
          const isToday = date === today;
          return (
            <li
              key={date}
              className={`card ${isToday ? "border-accent" : ""}`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-semibold">
                  {dayName(date)} {parseISO(date).getDate()}
                  {isToday && (
                    <span className="ml-2 text-xs text-accent">
                      Today
                    </span>
                  )}
                </span>
              </div>

              {dayEntries.length === 0 ? (
                <p className="text-sm text-muted">Rest day</p>
              ) : (
                <ul className="space-y-2">
                  {dayEntries.map((e) => (
                    <li key={e.scheduledId}>
                      <Link
                        href={`/schedule/${e.scheduledId}`}
                        className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5 transition-colors hover:bg-border"
                      >
                        <span className="font-medium">{e.workout.name}</span>
                        {e.result ? (
                          <span className="text-xs text-accent">
                            {e.result.score
                              ? e.result.score
                              : e.result.rx
                                ? "Rx ✓"
                                : "Logged ✓"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">
                            Log result →
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
