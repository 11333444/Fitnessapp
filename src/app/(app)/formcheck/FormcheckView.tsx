"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDisplayDate, parseDateOnly } from "@/lib/dates";

type WeightEntry = Tables<"weight_entries">;
type FormCheck = Tables<"form_checks"> & { urls: string[] };

export function FormcheckView({
  weightEntries,
  formChecks,
}: {
  weightEntries: WeightEntry[];
  formChecks: FormCheck[];
}) {
  const chartData = weightEntries.map((w) => ({
    date: formatDisplayDate(parseDateOnly(w.week_start_date)),
    weight: w.weight,
  }));

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Formcheck & Gewichtsverlauf
      </h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Gewichtsverlauf
        </h2>
        {chartData.length > 0 ? (
          <div className="h-72 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} unit=" kg" />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Noch keine Gewichtseinträge. Trage sonntags dein Gewicht in der Tagesansicht ein.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Formcheck-Verlauf
        </h2>
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
                  <img key={url} src={url} alt="Formcheck" className="aspect-square w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
