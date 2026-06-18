"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isProfileId, PROFILE_COOKIE } from "@/lib/profiles";

const MAX_AGE = 60 * 60 * 24 * 365;

export async function chooseProfile(formData: FormData) {
  const id = String(formData.get("profile") ?? "");
  if (!isProfileId(id)) {
    redirect("/");
  }

  const store = await cookies();
  store.set(PROFILE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  redirect("/schedule");
}

export async function clearProfile() {
  const store = await cookies();
  store.delete(PROFILE_COOKIE);
  redirect("/");
}
