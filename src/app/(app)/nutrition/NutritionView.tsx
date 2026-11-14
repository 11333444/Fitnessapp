"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { parseDateOnly, formatDisplayDate } from "@/lib/dates";
import { NUTRITION_PLAN } from "@/lib/nutritionPlan";

type ShoppingLog = Tables<"shopping_list_logs">;

export function NutritionView({
  weekStartDate,
  shoppingLogs,
}: {
  weekStartDate: string;
  shoppingLogs: ShoppingLog[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);

  const checkedKeys = new Set(shoppingLogs.filter((l) => l.checked).map((l) => l.item_key));
  const totalItems = NUTRITION_PLAN.shoppingList.reduce((sum, c) => sum + c.items.length, 0);

  async function toggleItem(itemKey: string, checked: boolean) {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase
      .from("shopping_list_logs")
      .upsert(
        { user_id: userData.user.id, week_start_date: weekStartDate, item_key: itemKey, checked },
        { onConflict: "user_id,week_start_date,item_key" },
      );
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Ernährung</h1>
        <p className="text-sm text-zinc-500">{NUTRITION_PLAN.title}</p>
        <p className="text-xs text-zinc-500">{NUTRITION_PLAN.goal}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Tagesziel</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MacroCard label="Kalorien" value={`${NUTRITION_PLAN.macros.kcal}`} unit="kcal" />
          <MacroCard label="Protein" value={`${NUTRITION_PLAN.macros.protein}`} unit="g" />
          <MacroCard label="Kohlenhydrate" value={`${NUTRITION_PLAN.macros.carbs}`} unit="g" />
          <MacroCard label="Fett" value={`${NUTRITION_PLAN.macros.fat}`} unit="g" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Tagesstruktur (jeden Tag gleich)
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {NUTRITION_PLAN.dailyStructure.map((s) => (
            <div
              key={s.key}
              className="space-y-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
            >
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.label}</div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{s.time}</div>
              <div className="text-xs text-zinc-500">ca. {s.kcal} kcal</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Portionsregel</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[500px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Baustein</th>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Menge pro Mahlzeit
                </th>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Austauschbar gegen
                </th>
              </tr>
            </thead>
            <tbody>
              {NUTRITION_PLAN.portionRules.map((r) => (
                <tr key={r.baustein} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-50">{r.baustein}</td>
                  <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">{r.menge}</td>
                  <td className="px-2 py-1.5 text-zinc-500">{r.austausch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Wochenplan</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Tag</th>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Aktivität</th>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Mittagessen</th>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Abendessen</th>
              </tr>
            </thead>
            <tbody>
              {NUTRITION_PLAN.weekPlan.map((d) => (
                <tr key={d.day} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-50">{d.day}</td>
                  <td className="px-2 py-1.5 text-zinc-500">{d.activity}</td>
                  <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">{d.mittag}</td>
                  <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">{d.abend}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-2 py-1.5 text-xs text-zinc-500">
            Gym-Snack (Banane, 5 Datteln, 1 EL Honig, 4 Reiswaffeln) an jedem Tag, 30–60 min vor dem Training bzw.
            als Nachmittagssnack an Ruhetagen.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Rezepte</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {NUTRITION_PLAN.recipes.map((r) => (
            <div
              key={r.name}
              className="space-y-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.name}</div>
                <div className="whitespace-nowrap text-xs text-zinc-500">
                  {r.kcal} kcal · {r.protein} g Protein
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.zutaten}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Hinweise</h2>
        <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
          {NUTRITION_PLAN.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Einkaufsliste</h2>
          <span className="text-xs text-zinc-500">
            Woche ab Sa, {formatDisplayDate(parseDateOnly(weekStartDate))} · {checkedKeys.size}/{totalItems}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {NUTRITION_PLAN.shoppingList.map((cat) => (
            <div
              key={cat.category}
              className="space-y-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{cat.category}</h3>
              {cat.items.map((item) => {
                const checked = checkedKeys.has(item.key);
                return (
                  <label key={item.key} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={busy}
                        onChange={(e) => toggleItem(item.key, e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-500"
                      />
                      <span
                        className={`text-sm ${
                          checked
                            ? "text-zinc-400 line-through dark:text-zinc-600"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {item.label}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-xs text-zinc-500">{item.amount}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          Die Liste setzt sich jeden Samstag automatisch zurück – neue Einkaufswoche, neue Haken.
        </p>
      </section>
    </div>
  );
}

function MacroCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-center">
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
        <span className="ml-1 text-xs font-normal text-zinc-500">{unit}</span>
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
