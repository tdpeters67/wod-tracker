"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { movements, workoutMovements } from "@/lib/db/schema";

export async function createMovement(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const typed = String(formData.get("category") ?? "").trim();
  if (!name) return;

  // Reuse an existing category if it matches case-insensitively, so a typed
  // "barbell" joins the existing "Barbell" group instead of making a new one.
  let category: string | null = typed || null;
  if (category) {
    const existing = await db
      .selectDistinct({ category: movements.category })
      .from(movements);
    const match = existing.find(
      (e) => e.category && e.category.toLowerCase() === category!.toLowerCase(),
    );
    if (match?.category) category = match.category;
  }

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
