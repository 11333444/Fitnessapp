"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/change-password`,
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-lg shadow-black/30 p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Passwort zurücksetzen
        </h1>

        {status === "sent" ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Falls diese E-Mail-Adresse existiert, wurde dir ein Link zum Zurücksetzen geschickt.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                E-Mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-700/70 bg-zinc-900/60 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600">Es ist ein Fehler aufgetreten.</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              Link senden
            </button>
          </>
        )}
      </form>
    </div>
  );
}
