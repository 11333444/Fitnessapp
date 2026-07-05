"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type Habit = Tables<"habits">;

const WEEKDAYS = [
  { iso: 1, label: "Mo" },
  { iso: 2, label: "Di" },
  { iso: 3, label: "Mi" },
  { iso: 4, label: "Do" },
  { iso: 5, label: "Fr" },
  { iso: 6, label: "Sa" },
  { iso: 7, label: "So" },
];

export function HabitsView({ habits, userId }: { habits: Habit[]; userId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [showArchived, setShowArchived] = useState(false);

  async function updateHabit(id: string, patch: Partial<Habit>) {
    await supabase.from("habits").update(patch).eq("id", id);
    router.refresh();
  }

  function toggleWeekday(habit: Habit, iso: number) {
    const has = habit.active_weekdays.includes(iso);
    const next = has
      ? habit.active_weekdays.filter((d) => d !== iso)
      : [...habit.active_weekdays, iso].sort();
    updateHabit(habit.id, { active_weekdays: next });
  }

  async function addHabit(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const type = String(form.get("type") ?? "boolean") as "boolean" | "numeric";
    const targetValueRaw = String(form.get("target_value") ?? "").trim();
    const unit = String(form.get("unit") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();

    await supabase.from("habits").insert({
      user_id: userId,
      name,
      type,
      target_value: type === "numeric" && targetValueRaw ? Number(targetValueRaw) : null,
      unit: unit || null,
      category: category || null,
      sort_order: habits.length,
    });
    router.refresh();
  }

  const visibleHabits = habits.filter((h) => (showArchived ? true : h.is_active));

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Meine Habits</h1>

      <form
        action={(fd) => addHabit(fd)}
        className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:grid-cols-5"
      >
        <input name="name" placeholder="Name" required className="col-span-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm sm:col-span-2" />
        <select name="type" className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm">
          <option value="boolean">Ja/Nein</option>
          <option value="numeric">Zielwert</option>
        </select>
        <input name="target_value" placeholder="Ziel (Zahl)" className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
        <input name="unit" placeholder="Einheit" className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
        <input name="category" placeholder="Kategorie (optional)" className="col-span-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm sm:col-span-4" />
        <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900">
          Hinzufügen
        </button>
      </form>

      <label className="flex items-center gap-2 text-sm text-zinc-500">
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
        Archivierte anzeigen
      </label>

      <div className="space-y-3">
        {visibleHabits.map((habit) => (
          <div
            key={habit.id}
            className={`space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 ${
              !habit.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <input
                defaultValue={habit.name}
                onBlur={(e) => e.target.value !== habit.name && updateHabit(habit.id, { name: e.target.value })}
                className="flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700"
              />
              <button
                onClick={() => updateHabit(habit.id, { is_active: !habit.is_active })}
                className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                {habit.is_active ? "Archivieren" : "Reaktivieren"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span>Kategorie: {habit.category ?? "–"}</span>
              {habit.type === "numeric" && (
                <span>
                  Ziel: {habit.target_value ?? "–"} {habit.unit}
                </span>
              )}
              {habit.linked_field && <span>Journal-Kopplung: {habit.linked_field}</span>}
            </div>

            <div className="flex gap-1">
              {WEEKDAYS.map((wd) => {
                const active = habit.active_weekdays.includes(wd.iso);
                return (
                  <button
                    key={wd.iso}
                    onClick={() => toggleWeekday(habit, wd.iso)}
                    className={`h-7 w-7 rounded-full text-xs font-medium ${
                      active
                        ? "bg-emerald-500 text-white"
                        : "border border-zinc-300 text-zinc-400 dark:border-zinc-700"
                    }`}
                  >
                    {wd.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
