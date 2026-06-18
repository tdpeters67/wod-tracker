import { cookies } from "next/headers";

/** The two (and only two) people who use this app. */
export const PROFILES = [
  { id: "tomas", name: "Tomas" },
  { id: "susan", name: "Susan" },
] as const;

export type ProfileId = (typeof PROFILES)[number]["id"];

export const PROFILE_COOKIE = "wod_profile";

export function isProfileId(value: string | undefined): value is ProfileId {
  return PROFILES.some((p) => p.id === value);
}

export function profileName(id: ProfileId): string {
  return PROFILES.find((p) => p.id === id)!.name;
}

/** Read the active profile from the cookie (or null if none selected). */
export async function getActiveProfile(): Promise<ProfileId | null> {
  const store = await cookies();
  const value = store.get(PROFILE_COOKIE)?.value;
  return isProfileId(value) ? value : null;
}
