import { createClient } from "jsr:@supabase/supabase-js@2";

type HabitTemplateItem = {
  name: string;
  type: "boolean" | "numeric";
  target_value?: number;
  unit?: string;
  category?: string;
  linked_field?: "note" | "no_limit_journal" | "gratitude_journal";
  sort_order: number;
};

const HABIT_TEMPLATE: HabitTemplateItem[] = [
  { name: "Termine 2+", type: "numeric", target_value: 2, unit: "Termine", category: "Produktivität", sort_order: 0 },
  { name: "unter 50€ ausgeben", type: "numeric", target_value: 50, unit: "€", category: "Finanzen", sort_order: 1 },
  { name: "30min Podcast / Lange o. Graf / Mindset", type: "numeric", target_value: 30, unit: "Min", category: "Mindset", sort_order: 2 },
  { name: "180g Protein", type: "numeric", target_value: 180, unit: "g", category: "Ernährung", sort_order: 3 },
  { name: "Bauernhof essen", type: "boolean", category: "Ernährung", sort_order: 4 },
  { name: "8.000 Schritte", type: "numeric", target_value: 8000, unit: "Schritte", category: "Fitness", sort_order: 5 },
  { name: "In den Haaren fummeln", type: "boolean", category: "Ticks", sort_order: 6 },
  { name: "6h produktiv arbeiten / lernen", type: "numeric", target_value: 6, unit: "h", category: "Produktivität", sort_order: 7 },
  { name: "wirklicher Fortschritt ja / nein", type: "boolean", category: "Produktivität", sort_order: 8 },
  { name: "no limit thinking and journaling", type: "boolean", category: "Mindset", linked_field: "no_limit_journal", sort_order: 9 },
  { name: "Makroziele erreicht", type: "boolean", category: "Ernährung", sort_order: 10 },
  { name: "5 Seiten lesen", type: "numeric", target_value: 5, unit: "Seiten", category: "Mindset", sort_order: 11 },
  { name: "Tagesreflektion", type: "boolean", category: "Mindset", linked_field: "note", sort_order: 12 },
  { name: "Liegestütze", type: "numeric", target_value: 50, unit: "Wiederholungen", category: "Fitness", sort_order: 13 },
  { name: "Dankbarkeit", type: "boolean", category: "Mindset", linked_field: "gratitude_journal", sort_order: 14 },
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Not authenticated" }, 401);
    }

    const { data: profile, error: profileError } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return json({ error: "Forbidden" }, 403);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    if (body.action === "create_user") {
      const { email, display_name, password } = body;
      if (!email || !password) {
        return json({ error: "email und password sind erforderlich" }, 400);
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name ?? email },
      });

      if (createError || !created.user) {
        return json({ error: createError?.message ?? "Fehler beim Anlegen des Users" }, 400);
      }

      const newUserId = created.user.id;
      const habitsToInsert = HABIT_TEMPLATE.map((h) => ({ ...h, user_id: newUserId }));
      const { error: habitsError } = await admin.from("habits").insert(habitsToInsert);

      if (habitsError) {
        return json(
          { error: `User angelegt, aber Habit-Vorlage fehlgeschlagen: ${habitsError.message}` },
          500,
        );
      }

      return json({ user_id: newUserId, email });
    }

    if (body.action === "reset_password") {
      const { user_id, password } = body;
      if (!user_id || !password) {
        return json({ error: "user_id und password sind erforderlich" }, 400);
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(user_id, { password });
      if (updateError) {
        return json({ error: updateError.message }, 400);
      }

      const { error: flagError } = await admin
        .from("profiles")
        .update({ must_change_password: true })
        .eq("id", user_id);

      if (flagError) {
        return json({ error: flagError.message }, 500);
      }

      return json({ ok: true });
    }

    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});
