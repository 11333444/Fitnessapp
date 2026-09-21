import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { parseDateOnly, todayUTC, toDateOnly } from "@/lib/dates";
import { TrainingView } from "./TrainingView";

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayUTC();

  const session = await getCurrentUserAndProfile();
  if (!session) return null;
  const { userId } = session;

  const supabase = await createClient();

  const [{ data: exercises }, { data: logsForDate }, { data: allLogs }, { data: swimLogsForDate }, { data: allSwimLogs }] =
    await Promise.all([
      supabase
        .from("exercises")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("exercise_logs").select("*").eq("date", date),
      supabase.from("exercise_logs").select("*").order("date"),
      supabase.from("swim_logs").select("*").eq("user_id", userId).eq("date", date),
      supabase.from("swim_logs").select("*").eq("user_id", userId).order("date"),
    ]);

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const logsForDateFiltered = (logsForDate ?? []).filter((l) => exerciseIds.includes(l.exercise_id));
  const allLogsFiltered = (allLogs ?? []).filter((l) => exerciseIds.includes(l.exercise_id));

  const current = parseDateOnly(date);
  const prevDate = toDateOnly(new Date(current.getTime() - 86400000));
  const nextDate = toDateOnly(new Date(current.getTime() + 86400000));

  return (
    <TrainingView
      date={date}
      prevDate={prevDate}
      nextDate={nextDate}
      exercises={exercises ?? []}
      logsForDate={logsForDateFiltered}
      allLogs={allLogsFiltered}
      swimLogsForDate={swimLogsForDate ?? []}
      allSwimLogs={allSwimLogs ?? []}
    />
  );
}
