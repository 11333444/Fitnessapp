import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { HabitsView } from "./HabitsView";

export default async function HabitsPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) return null;

  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", session.userId)
    .order("sort_order");

  return <HabitsView habits={habits ?? []} userId={session.userId} />;
}
