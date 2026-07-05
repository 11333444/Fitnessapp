"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/lib/supabase/database.types";
import { callAdminUsersFunction } from "@/lib/supabase/edgeFunctions";

type Profile = Tables<"profiles">;

export function AdminView({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    const { data, error } = await callAdminUsersFunction({
      action: "create_user",
      email,
      display_name: displayName || null,
      password,
    });

    setBusy(false);

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setMessage({ type: "ok", text: `User ${data?.email} wurde angelegt.` });
    setEmail("");
    setDisplayName("");
    setPassword("");
    router.refresh();
  }

  async function handleResetPassword(userId: string, userEmail: string | null) {
    const newPassword = window.prompt(`Neues Default-Passwort für ${userEmail ?? userId}:`);
    if (!newPassword) return;

    setBusy(true);
    const { error } = await callAdminUsersFunction({
      action: "reset_password",
      user_id: userId,
      password: newPassword,
    });
    setBusy(false);

    if (error) {
      setMessage({ type: "error", text: error });
    } else {
      setMessage({ type: "ok", text: "Passwort wurde zurückgesetzt." });
      router.refresh();
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin: Userverwaltung</h1>

      <form
        onSubmit={handleCreateUser}
        className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4"
      >
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Neuen User anlegen</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="email"
            placeholder="E-Mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Anzeigename (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Default-Passwort"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 disabled:opacity-50"
        >
          Anlegen
        </button>
        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">E-Mail</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Rolle</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Passwort-Status</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{p.email}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{p.display_name}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{p.role}</td>
                <td className="px-3 py-2 text-zinc-500">
                  {p.must_change_password ? "Muss ändern" : "Gesetzt"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => handleResetPassword(p.id, p.email)}
                    disabled={busy}
                    className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Passwort zurücksetzen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
