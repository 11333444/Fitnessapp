import type { Tables } from "@/lib/supabase/database.types";
import { isoWeekday, parseDateOnly, toDateOnly } from "@/lib/dates";

type Habit = Tables<"habits">;
type HabitLog = Tables<"habit_logs">;

export function habitAppliesOnDate(habit: Pick<Habit, "active_weekdays">, date: Date): boolean {
  return habit.active_weekdays.includes(isoWeekday(date));
}

export interface ProgressResult {
  completed: number;
  total: number;
  percent: number;
}

function toPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/** Fortschritt für einen einzelnen Tag über alle an diesem Tag aktiven Habits. */
export function dayProgress(
  habits: Habit[],
  logs: HabitLog[],
  date: Date,
): ProgressResult {
  const dateStr = toDateOnly(date);
  const applicable = habits.filter((h) => habitAppliesOnDate(h, date));
  const completedCount = applicable.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.date === dateStr && l.completed),
  ).length;

  return {
    completed: completedCount,
    total: applicable.length,
    percent: toPercent(completedCount, applicable.length),
  };
}

/** Fortschritt über mehrere Tage (Woche/Monat), gewichtet nach an dem jeweiligen Tag aktiven Habits. */
export function periodProgress(
  habits: Habit[],
  logs: HabitLog[],
  dates: Date[],
): ProgressResult {
  let completed = 0;
  let total = 0;

  for (const date of dates) {
    const result = dayProgress(habits, logs, date);
    completed += result.completed;
    total += result.total;
  }

  return { completed, total, percent: toPercent(completed, total) };
}

/** Aktueller Streak (Anzahl aufeinanderfolgender Tage bis heute, an denen ein Habit erledigt wurde). */
export function currentStreak(habitId: string, logs: HabitLog[], today: Date): number {
  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const dateStr = toDateOnly(cursor);
    const log = logs.find((l) => l.habit_id === habitId && l.date === dateStr);
    if (!log?.completed) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export { parseDateOnly };
