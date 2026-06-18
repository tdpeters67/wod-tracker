import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { chooseProfile } from "@/lib/actions/profile";
import { PROFILES } from "@/lib/profiles";

export default function ChooserPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">WOD Tracker</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-text"
          >
            Log out
          </button>
        </form>
      </div>

      <p className="mt-1 text-sm text-muted">Who&apos;s training?</p>

      <div className="mt-6 grid gap-3">
        {PROFILES.map((p) => (
          <form key={p.id} action={chooseProfile}>
            <input type="hidden" name="profile" value={p.id} />
            <button
              type="submit"
              className="card flex w-full items-center justify-between text-left transition-colors hover:border-accent"
            >
              <span>
                <span className="block text-lg font-semibold">{p.name}</span>
                <span className="text-sm text-muted">
                  View calendar &amp; log workouts
                </span>
              </span>
              <span aria-hidden className="text-2xl text-muted">
                →
              </span>
            </button>
          </form>
        ))}

        <Link
          href="/workouts"
          className="card flex items-center justify-between transition-colors hover:border-accent"
        >
          <span>
            <span className="block text-lg font-semibold">WOD Library</span>
            <span className="text-sm text-muted">
              Shared workouts &amp; movements
            </span>
          </span>
          <span aria-hidden className="text-2xl text-muted">
            →
          </span>
        </Link>
      </div>
    </main>
  );
}
