import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/session";
import { FormcheckView } from "./FormcheckView";

export default async function FormcheckPage() {
  const session = await getCurrentUserAndProfile();
  if (!session) return null;

  const supabase = await createClient();

  const [{ data: weightEntries }, { data: formChecks }] = await Promise.all([
    supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", session.userId)
      .order("week_start_date"),
    supabase
      .from("form_checks")
      .select("*")
      .eq("user_id", session.userId)
      .order("week_start_date", { ascending: false }),
  ]);

  const formChecksWithUrls = await Promise.all(
    (formChecks ?? []).map(async (fc) => {
      const urls = await Promise.all(
        fc.photo_paths.map(async (path) => {
          const { data } = await supabase.storage.from("form-checks").createSignedUrl(path, 3600);
          return data?.signedUrl ?? "";
        }),
      );
      return { ...fc, urls: urls.filter(Boolean) };
    }),
  );

  return <FormcheckView weightEntries={weightEntries ?? []} formChecks={formChecksWithUrls} />;
}
