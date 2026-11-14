import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { shoppingWeekStart, toDateOnly } from "@/lib/dates";
import { NutritionView } from "./NutritionView";

export default async function NutritionPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) return null;
  const { userId } = session;

  const weekStartDate = toDateOnly(shoppingWeekStart(new Date()));

  const supabase = await createClient();
  const { data: shoppingLogs } = await supabase
    .from("shopping_list_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start_date", weekStartDate);

  return <NutritionView weekStartDate={weekStartDate} shoppingLogs={shoppingLogs ?? []} />;
}
