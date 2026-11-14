"use client";

import {
  ComposedChart,
  Line,
  Area,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDisplayDate, formatShortDate, parseDateOnly } from "@/lib/dates";
import { LEAN_BULK_WEIGHT_PLAN, WEIGHT_CORRIDOR } from "@/lib/leanBulkWeightPlan";

type WeightEntry = Tables<"weight_entries">;
type FormCheck = Tables<"form_checks"> & { urls: string[] };

type ChartPoint = {
  date: string;
  shortDate: string | null;
  sortKey: string;
  weight: number | null;
  target: number | null;
  corridor: [number, number] | null;
};

export function FormcheckView({
  weightEntries,
  formChecks,
}: {
  weightEntries: WeightEntry[];
  formChecks: FormCheck[];
}) {
  const byDate = new Map<string, ChartPoint>();

  for (const plan of LEAN_BULK_WEIGHT_PLAN) {
    byDate.set(plan.date, {
      date: formatDisplayDate(parseDateOnly(plan.date)),
      shortDate: null,
      sortKey: plan.date,
      weight: null,
      target: plan.target,
      corridor: [plan.target - WEIGHT_CORRIDOR, plan.target + WEIGHT_CORRIDOR],
    });
  }

  for (const w of weightEntries) {
    const shortDate = formatShortDate(parseDateOnly(w.week_start_date));
    const existing = byDate.get(w.week_start_date);
    if (existing) {
      existing.weight = w.weight;
      existing.shortDate = shortDate;
    } else {
      byDate.set(w.week_start_date, {
        date: formatDisplayDate(parseDateOnly(w.week_start_date)),
        shortDate,
        sortKey: w.week_start_date,
        weight: w.weight,
        target: null,
        corridor: null,
      });
    }
  }

  const chartData = Array.from(byDate.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const allValues: number[] = [];
  for (const p of chartData) {
    if (p.weight != null) allValues.push(p.weight);
    if (p.target != null) allValues.push(p.target);
    if (p.corridor) allValues.push(p.corridor[0], p.corridor[1]);
  }
  const yDomain: [number, number] =
    allValues.length > 0
      ? [Math.floor(Math.min(...allValues) - 1), Math.ceil(Math.max(...allValues) + 1)]
      : [85, 105];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Formcheck &amp; Gewichtsverlauf
        </h1>
        <p className="text-xs text-zinc-500">
          Lean-Bulk-Ziel: 88 kg → 91 kg bis 30. Apr 2027 · Zielkorridor ±{WEIGHT_CORRIDOR} kg
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Gewichtsverlauf</h2>
        {chartData.length > 0 ? (
          <div className="h-80 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 p-3 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} domain={yDomain} allowDataOverflow unit=" kg" width={48} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  dataKey="corridor"
                  name="Zielkorridor"
                  stroke="none"
                  fill="#f59e0b"
                  fillOpacity={0.12}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Ziel-Ø"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Dein Gewicht"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#weightFill)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="shortDate"
                    position="top"
                    offset={10}
                    fontSize={9}
                    fill="#a1a1aa"
                  />
                </Area>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Noch keine Gewichtseinträge. Trage sonntags dein Gewicht in der Tagesansicht ein.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Formcheck-Verlauf</h2>
        {formChecks.length === 0 && (
          <p className="text-sm text-zinc-500">Noch keine Formcheck-Bilder hochgeladen.</p>
        )}
        <div className="space-y-4">
          {formChecks.map((fc) => (
            <div key={fc.id} className="space-y-2">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Woche {formatDisplayDate(parseDateOnly(fc.week_start_date))}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {fc.urls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="Formcheck"
                    className="aspect-square w-full rounded-xl object-cover shadow-sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
