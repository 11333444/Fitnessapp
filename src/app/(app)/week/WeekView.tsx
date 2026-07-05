"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { periodProgress, habitAppliesOnDate } from "@/lib/progress";
import { parseDateOnly, weekdayLabelDE, isoWeekday, formatDisplayDate } from "@/lib/dates";
import { ProgressBar } from "@/components/ProgressBar";

type Habit = Tables<"habits">;
type HabitLog = Tables<"habit_logs">;
type Workout = Tables<"workouts">;

const WORKOUT_TYPES: { value: string; label: string }[] = [
  { value: "rest", label: "Rest" },
  { value: "swimming", label: "Schwimmen" },
  { value: "running", label: "Laufen" },
  { value: "cycling", label: "Rennrad" },
  { value: "strength", label: "Kraft" },
];

export function WeekView({
  referenceDate,
  prevWeekDate,
  nextWeekDate,
  weekDates,
  monthDates,
  habits,
  logs,
  workouts,
}: {
  referenceDate: string;
  prevWeekDate: string;
  nextWeekDate: string;
  weekDates: string[];
  monthDates: string[];
  habits: Habit[];
  logs: HabitLog[];
  workouts: Workout[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);

  const weekDateObjs = weekDates.map(parseDateOnly);
  const monthDateObjs = monthDates.map(parseDateOnly);

  const weekProgress = periodProgress(habits, logs, weekDateObjs);
  const monthProgress = periodProgress(habits, logs, monthDateObjs);

  async function toggleHabit(habit: Habit, date: string, completed: boolean) {
    setBusy(true);
    await supabase
      .from("habit_logs")
      .upsert({ habit_id: habit.id, date, completed }, { onConflict: "habit_id,date" });
    setBusy(false);
    router.refresh();
  }

  async function toggleWorkout(date: string, type: string) {
    setBusy(true);
    const existing = workouts.find((w) => w.type === type && w.date === date);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (existing) {
      await supabase.from("workouts").delete().eq("id", existing.id);
    } else {
      await supabase.from("workouts").insert({ user_id: userData.user.id, date, type });
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href={`/week?date=${prevWeekDate}`}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ← Vorherige Woche
        </Link>
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatDisplayDate(weekDateObjs[0])} – {formatDisplayDate(weekDateObjs[6])}
          </div>
          <Link
            href={`/day?date=${referenceDate}`}
            className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Zur Tagesansicht
          </Link>
        </div>
        <Link
          href={`/week?date=${nextWeekDate}`}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Nächste Woche →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ProgressBar label="Wochenfortschritt" {...weekProgress} />
        <ProgressBar label="Monatsfortschritt" {...monthProgress} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="sticky left-0 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Habit
              </th>
              {weekDateObjs.map((d) => (
                <th key={d.toISOString()} className="px-2 py-2 text-center font-medium text-zinc-600 dark:text-zinc-400">
                  {weekdayLabelDE(isoWeekday(d))}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-medium text-zinc-600 dark:text-zinc-400">Woche</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const habitLogs = logs.filter((l) => l.habit_id === habit.id);
              const applicableDays = weekDateObjs.filter((d) => habitAppliesOnDate(habit, d));
              const completedDays = applicableDays.filter((d) => {
                const dateStr = weekDates[weekDateObjs.indexOf(d)];
                return habitLogs.some((l) => l.date === dateStr && l.completed);
              }).length;
              const pct = applicableDays.length ? Math.round((completedDays / applicableDays.length) * 100) : 0;

              return (
                <tr key={habit.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="sticky left-0 bg-white dark:bg-zinc-950 px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                    {habit.name}
                  </td>
                  {weekDates.map((dateStr, i) => {
                    const applies = habitAppliesOnDate(habit, weekDateObjs[i]);
                    if (!applies) {
                      return (
                        <td key={dateStr} className="px-2 py-2 text-center text-zinc-300 dark:text-zinc-700">
                          –
                        </td>
                      );
                    }
                    const completed = habitLogs.some((l) => l.date === dateStr && l.completed);
                    return (
                      <td key={dateStr} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={completed}
                          disabled={busy}
                          onChange={(e) => toggleHabit(habit, dateStr, e.target.checked)}
                          className="h-4 w-4 rounded accent-emerald-500"
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-xs text-zinc-500">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Training</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Typ</th>
                {weekDateObjs.map((d) => (
                  <th key={d.toISOString()} className="px-2 py-2 text-center font-medium text-zinc-600 dark:text-zinc-400">
                    {weekdayLabelDE(isoWeekday(d))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKOUT_TYPES.map((wt) => (
                <tr key={wt.value} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">{wt.label}</td>
                  {weekDates.map((dateStr) => {
                    const active = workouts.some((w) => w.type === wt.value && w.date === dateStr);
                    return (
                      <td key={dateStr} className="px-2 py-2 text-center">
                        <button
                          onClick={() => toggleWorkout(dateStr, wt.value)}
                          disabled={busy}
                          className={`h-5 w-5 rounded-full ${
                            active ? "bg-zinc-900 dark:bg-zinc-50" : "border border-zinc-300 dark:border-zinc-700"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
