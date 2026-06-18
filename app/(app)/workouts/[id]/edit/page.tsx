import { notFound } from "next/navigation";
import WorkoutForm from "@/components/WorkoutForm";
import { updateWorkout } from "@/lib/actions/workouts";
import { getMovements, getWorkout } from "@/lib/queries";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = Number(id);
  const [workout, movements] = await Promise.all([
    getWorkout(workoutId),
    getMovements(),
  ]);
  if (!workout) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Edit workout</h1>
      <WorkoutForm
        movements={movements}
        action={updateWorkout.bind(null, workoutId)}
        defaults={{
          name: workout.name,
          type: workout.type,
          scoreType: workout.scoreType,
          timeCapMinutes: workout.timeCapSeconds
            ? Math.round(workout.timeCapSeconds / 60)
            : "",
          prescription: workout.prescription ?? "",
          description: workout.description ?? "",
          movementIds: workout.movements.map((m) => m.id),
        }}
        submitLabel="Save changes"
        cancelHref={`/workouts/${workoutId}`}
      />
    </div>
  );
}
