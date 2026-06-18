import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getActiveProfile, profileName } from "@/lib/profiles";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getActiveProfile();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ← WOD Tracker
          </Link>
          <span className="text-sm text-muted">
            {profile ? profileName(profile) : "Library"}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
