"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: userData, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError || !userData.user) {
      setLoading(false);
      setError("Passwort konnte nicht geändert werden.");
      return;
    }

    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", userData.user.id);

    setLoading(false);
    router.replace("/day");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-lg shadow-black/30 p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Neues Passwort festlegen
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aus Sicherheitsgründen musst du ein eigenes Passwort vergeben.
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Neues Passwort
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700/70 bg-zinc-900/60 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Passwort bestätigen
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700/70 bg-zinc-900/60 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Speichern…" : "Passwort speichern"}
        </button>
      </form>
    </div>
  );
}
