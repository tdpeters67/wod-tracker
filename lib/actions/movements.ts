"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { movements, workoutMovements } from "@/lib/db/schema";

export async function createMovement(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  if (!name) return;

  await db
    .insert(movements)
    .values({ name, category })
    .onConflictDoNothing({ target: movements.name });

  revalidatePath("/movements");
  revalidatePath("/workouts");
}

export async function deleteMovement(id: number) {
  await db.delete(workoutMovements).where(eq(workoutMovements.movementId, id));
  await db.delete(movements).where(eq(movements.id, id));
  revalidatePath("/movements");
  revalidatePath("/workouts");
}
