import { createClient } from "@/lib/supabase/client";

export async function callAdminUsersFunction(
  body: Record<string, unknown>,
): Promise<{ data?: Record<string, unknown>; error?: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Nicht angemeldet." };
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-users`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    return { error: json.error ?? "Unbekannter Fehler" };
  }
  return { data: json };
}
