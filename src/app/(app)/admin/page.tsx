import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { AdminView } from "./AdminView";

export default async function AdminPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) return null;
  if (session.profile.role !== "admin") {
    redirect("/day");
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminView profiles={profiles ?? []} />;
}
