"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">WOD Tracker</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the shared password to continue.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="input"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-accent">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
