"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { parseDateOnly, weekdayLabelDE, isoWeekday, formatDisplayDate } from "@/lib/dates";

type Exercise = Tables<"exercises">;
type ExerciseLog = Tables<"exercise_logs">;

export function TrainingView({
  date,
  prevDate,
  nextDate,
  exercises,
  logsForDate,
  allLogs,
}: {
  date: string;
  prevDate: string;
  nextDate: string;
  exercises: Exercise[];
  logsForDate: ExerciseLog[];
  allLogs: ExerciseLog[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const dateObj = useMemo(() => parseDateOnly(date), [date]);
  const isoDay = isoWeekday(dateObj);
  const [busy, setBusy] = useState(false);

  async function saveLog(exerciseId: string, weight: string, reps: string) {
    const weightNum = Number(weight.replace(",", "."));
    const repsNum = Number(reps);
    if (Number.isNaN(weightNum) || Number.isNaN(repsNum) || weight === "" || reps === "") return;

    setBusy(true);
    await supabase
      .from("exercise_logs")
      .upsert(
        { exercise_id: exerciseId, date, weight: weightNum, reps: repsNum },
        { onConflict: "exercise_id,date" },
      );
    setBusy(false);
    router.refresh();
  }

  async function addExercise(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setBusy(true);
    await supabase.from("exercises").insert({
      user_id: userData.user.id,
      name,
      sort_order: exercises.length,
    });
    setBusy(false);
    router.refresh();
  }

  async function archiveExercise(id: string) {
    setBusy(true);
    await supabase.from("exercises").update({ is_active: false }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function renameExercise(id: string, name: string) {
    if (!name.trim()) return;
    await supabase.from("exercises").update({ name: name.trim() }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Trainingsplan</h1>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Wochenplan
        </h2>
        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li>🏋️ 3× Ganzkörper-Krafttraining pro Woche (Übungen unten eintragen)</li>
          <li>🏊 2× Cardio (Schwimmen) pro Woche</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Schwimmtrainingsplan
        </h2>
        <p className="text-sm text-zinc-500">
          Noch nicht hinterlegt — schick mir deinen Plan, dann trage ich ihn hier ein.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Übungen eintragen
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/training?date=${prevDate}`} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              ← {" "}
            </Link>
            <span className="text-zinc-700 dark:text-zinc-300">
              {weekdayLabelDE(isoDay)}, {formatDisplayDate(dateObj)}
            </span>
            <Link href={`/training?date=${nextDate}`} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              →
            </Link>
          </div>
        </div>

        <form
          action={(fd) => addExercise(fd)}
          className="flex gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
        >
          <input
            name="name"
            placeholder="Neue Übung (z.B. Kniebeuge)"
            required
            className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </form>

        <div className="space-y-4">
          {exercises.map((exercise) => {
            const log = logsForDate.find((l) => l.exercise_id === exercise.id);
            const history = allLogs
              .filter((l) => l.exercise_id === exercise.id)
              .map((l) => ({
                date: formatDisplayDate(parseDateOnly(l.date)),
                weight: l.weight,
                reps: l.reps,
              }));

            return (
              <div
                key={exercise.id}
                className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    defaultValue={exercise.name}
                    onBlur={(e) => e.target.value !== exercise.name && renameExercise(exercise.id, e.target.value)}
                    className="flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700"
                  />
                  <button
                    onClick={() => archiveExercise(exercise.id)}
                    className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Archivieren
                  </button>
                </div>

                <ExerciseLogInputs
                  defaultWeight={log?.weight?.toString() ?? ""}
                  defaultReps={log?.reps?.toString() ?? ""}
                  onSave={(weight, reps) => saveLog(exercise.id, weight, reps)}
                />

                {history.length > 0 ? (
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} unit=" kg" />
                        <Tooltip formatter={(value, name) => (name === "weight" ? `${value} kg` : value)} />
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Noch keine Einträge für diese Übung.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ExerciseLogInputs({
  defaultWeight,
  defaultReps,
  onSave,
}: {
  defaultWeight: string;
  defaultReps: string;
  onSave: (weight: string, reps: string) => void;
}) {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-zinc-500">Gewicht (kg)</label>
      <input
        type="number"
        step="0.5"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => onSave(weight, reps)}
        className="w-20 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
      />
      <label className="text-zinc-500">Wiederholungen</label>
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => onSave(weight, reps)}
        className="w-16 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
      />
    </div>
  );
}
