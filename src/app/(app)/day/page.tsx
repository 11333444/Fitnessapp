import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { parseDateOnly, todayUTC, isSundayDate, weekSunday, toDateOnly } from "@/lib/dates";
import { DayView } from "./DayView";

export default async function DayPage({
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

  const [{ data: habits }, { data: logs }, { data: dailyEntry }, { data: workouts }, { data: mealPhotos }] =
    await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("habit_logs").select("*").eq("date", date),
      supabase.from("daily_entries").select("*").eq("user_id", userId).eq("date", date).maybeSingle(),
      supabase.from("workouts").select("*").eq("user_id", userId).eq("date", date),
      supabase
        .from("meal_photos")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .order("created_at"),
    ]);

  const habitIds = (habits ?? []).map((h) => h.id);
  const logsForUser = (logs ?? []).filter((l) => habitIds.includes(l.habit_id));

  const mealPhotosWithUrls = await Promise.all(
    (mealPhotos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(photo.photo_path, 3600);
      return { ...photo, url: data?.signedUrl ?? null };
    }),
  );

  let weekly: { weight: number | null; formCheckUrls: string[] } | null = null;
  if (isSundayDate(date)) {
    const [{ data: weightEntry }, { data: formCheck }] = await Promise.all([
      supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start_date", date)
        .maybeSingle(),
      supabase
        .from("form_checks")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start_date", date)
        .maybeSingle(),
    ]);

    const formCheckUrls = await Promise.all(
      (formCheck?.photo_paths ?? []).map(async (path) => {
        const { data } = await supabase.storage.from("form-checks").createSignedUrl(path, 3600);
        return data?.signedUrl ?? "";
      }),
    );

    weekly = { weight: weightEntry?.weight ?? null, formCheckUrls: formCheckUrls.filter(Boolean) };
  }

  const current = parseDateOnly(date);
  const prevDate = toDateOnly(new Date(current.getTime() - 86400000));
  const nextDate = toDateOnly(new Date(current.getTime() + 86400000));

  return (
    <DayView
      date={date}
      prevDate={prevDate}
      nextDate={nextDate}
      habits={habits ?? []}
      logs={logsForUser}
      dailyEntry={dailyEntry ?? null}
      workouts={workouts ?? []}
      mealPhotos={mealPhotosWithUrls}
      isSunday={isSundayDate(date)}
      weekSundayDate={toDateOnly(weekSunday(current))}
      weekly={weekly}
    />
  );
}
