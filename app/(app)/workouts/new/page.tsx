import WorkoutForm from "@/components/WorkoutForm";
import { createWorkout } from "@/lib/actions/workouts";
import { getMovements } from "@/lib/queries";

export default async function NewWorkoutPage() {
  const movements = await getMovements();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">New workout</h1>
      <WorkoutForm
        movements={movements}
        action={createWorkout}
        submitLabel="Create workout"
        cancelHref="/workouts"
      />
    </div>
  );
}
