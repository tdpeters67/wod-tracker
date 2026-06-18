import { config } from "dotenv";

config({ path: ".env.local" });

import { db } from "./index";
import { movements } from "./schema";

/** Curated CrossFit starter movements, grouped by category. */
const STARTER_MOVEMENTS: { name: string; category: string }[] = [
  // Barbell
  { name: "Back Squat", category: "Barbell" },
  { name: "Front Squat", category: "Barbell" },
  { name: "Overhead Squat", category: "Barbell" },
  { name: "Deadlift", category: "Barbell" },
  { name: "Clean", category: "Barbell" },
  { name: "Power Clean", category: "Barbell" },
  { name: "Snatch", category: "Barbell" },
  { name: "Power Snatch", category: "Barbell" },
  { name: "Clean and Jerk", category: "Barbell" },
  { name: "Push Press", category: "Barbell" },
  { name: "Push Jerk", category: "Barbell" },
  { name: "Shoulder Press", category: "Barbell" },
  { name: "Thruster", category: "Barbell" },
  // Gymnastics
  { name: "Pull-up", category: "Gymnastics" },
  { name: "Chest-to-Bar Pull-up", category: "Gymnastics" },
  { name: "Muscle-up", category: "Gymnastics" },
  { name: "Ring Muscle-up", category: "Gymnastics" },
  { name: "Toes-to-Bar", category: "Gymnastics" },
  { name: "Handstand Push-up", category: "Gymnastics" },
  { name: "Handstand Walk", category: "Gymnastics" },
  { name: "Push-up", category: "Gymnastics" },
  { name: "Ring Dip", category: "Gymnastics" },
  { name: "Sit-up", category: "Gymnastics" },
  { name: "Air Squat", category: "Gymnastics" },
  { name: "Pistol", category: "Gymnastics" },
  { name: "Rope Climb", category: "Gymnastics" },
  { name: "Burpee", category: "Gymnastics" },
  // Conditioning / Monostructural
  { name: "Run", category: "Conditioning" },
  { name: "Row", category: "Conditioning" },
  { name: "Bike", category: "Conditioning" },
  { name: "Ski Erg", category: "Conditioning" },
  { name: "Double-under", category: "Conditioning" },
  { name: "Single-under", category: "Conditioning" },
  { name: "Box Jump", category: "Conditioning" },
  // Odd object / Accessory
  { name: "Wall Ball", category: "Odd Object" },
  { name: "Kettlebell Swing", category: "Odd Object" },
  { name: "Dumbbell Snatch", category: "Odd Object" },
  { name: "Devil Press", category: "Odd Object" },
  { name: "Sandbag Clean", category: "Odd Object" },
  { name: "Farmer Carry", category: "Odd Object" },
  { name: "Sled Push", category: "Odd Object" },
];

async function main() {
  let inserted = 0;
  for (const m of STARTER_MOVEMENTS) {
    const res = await db
      .insert(movements)
      .values(m)
      .onConflictDoNothing({ target: movements.name });
    inserted += res.rowsAffected ?? 0;
  }
  console.log(
    `Seed complete. Inserted ${inserted} new movement(s) (${STARTER_MOVEMENTS.length} in starter list).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
