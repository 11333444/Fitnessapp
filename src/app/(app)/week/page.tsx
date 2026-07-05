import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { parseDateOnly, todayUTC, weekDays, monthDays, toDateOnly } from "@/lib/dates";
import { WeekView } from "./WeekView";

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayUTC();
  const referenceDate = parseDateOnly(date);

  const session = await getCurrentUserAndProfile();
  if (!session) return null;
  const { userId } = session;

  const supabase = await createClient();

  const days = weekDays(referenceDate);
  const monthDates = monthDays(referenceDate);
  const weekDateStrs = days.map(toDateOnly);
  const monthDateStrs = monthDates.map(toDateOnly);
  const rangeStart = monthDateStrs[0];
  const rangeEnd = monthDateStrs[monthDateStrs.length - 1];

  const [{ data: habits }, { data: logsInMonthRange }, { data: workouts }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("habit_logs")
      .select("*")
      .gte("date", rangeStart)
      .lte("date", rangeEnd),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .in("date", weekDateStrs),
  ]);

  const habitIds = (habits ?? []).map((h) => h.id);
  const logs = (logsInMonthRange ?? []).filter((l) => habitIds.includes(l.habit_id));

  const prevWeekDate = toDateOnly(new Date(referenceDate.getTime() - 7 * 86400000));
  const nextWeekDate = toDateOnly(new Date(referenceDate.getTime() + 7 * 86400000));

  return (
    <WeekView
      referenceDate={date}
      prevWeekDate={prevWeekDate}
      nextWeekDate={nextWeekDate}
      weekDates={weekDateStrs}
      monthDates={monthDateStrs}
      habits={habits ?? []}
      logs={logs}
      workouts={workouts ?? []}
    />
  );
}
