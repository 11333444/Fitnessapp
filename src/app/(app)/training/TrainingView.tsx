"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { parseDateOnly, weekdayLabelDE, isoWeekday, formatDisplayDate } from "@/lib/dates";
import { SWIM_PLAN, type SwimUnitKey } from "@/lib/swimPlan";

type Exercise = Tables<"exercises">;
type ExerciseLog = Tables<"exercise_logs">;
type SwimLog = Tables<"swim_logs">;

export function TrainingView({
  date,
  prevDate,
  nextDate,
  exercises,
  logsForDate,
  allLogs,
  swimLogsForDate,
  allSwimLogs,
}: {
  date: string;
  prevDate: string;
  nextDate: string;
  exercises: Exercise[];
  logsForDate: ExerciseLog[];
  allLogs: ExerciseLog[];
  swimLogsForDate: SwimLog[];
  allSwimLogs: SwimLog[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const dateObj = useMemo(() => parseDateOnly(date), [date]);
  const isoDay = isoWeekday(dateObj);
  const [busy, setBusy] = useState(false);

  async function saveLog(exerciseId: string, weight: string, reps: string) {
    const weightNum = Number(weight.replace(",", "."));
    const repsNum = Number(reps);
    if (Number.isNaN(weightNum) || Number.isNaN(repsNum) || weight === "" || reps === "") return;

    setBusy(true);
    await supabase
      .from("exercise_logs")
      .upsert(
        { exercise_id: exerciseId, date, weight: weightNum, reps: repsNum },
        { onConflict: "exercise_id,date" },
      );
    setBusy(false);
    router.refresh();
  }

  async function addExercise(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setBusy(true);
    await supabase.from("exercises").insert({
      user_id: userData.user.id,
      name,
      sort_order: exercises.length,
    });
    setBusy(false);
    router.refresh();
  }

  async function archiveExercise(id: string) {
    setBusy(true);
    await supabase.from("exercises").update({ is_active: false }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function renameExercise(id: string, name: string) {
    if (!name.trim()) return;
    await supabase.from("exercises").update({ name: name.trim() }).eq("id", id);
    router.refresh();
  }

  async function saveSwimLog(unit: SwimUnitKey, stufe: string, gefuehl: string, notiz: string) {
    const stufeNum = Number(stufe);
    if (!stufeNum || stufeNum < 1 || stufeNum > 5) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setBusy(true);
    await supabase.from("swim_logs").upsert(
      {
        user_id: userData.user.id,
        date,
        unit,
        stufe: stufeNum,
        gefuehl: gefuehl ? Number(gefuehl) : null,
        notiz: notiz || null,
      },
      { onConflict: "user_id,date,unit" },
    );
    setBusy(false);
    router.refresh();
  }

  const swimHistory = useMemo(() => {
    const byDate = new Map<string, { date: string; tempo?: number; ausdauer?: number }>();
    for (const log of allSwimLogs) {
      const label = formatDisplayDate(parseDateOnly(log.date));
      const entry = byDate.get(label) ?? { date: label };
      entry[log.unit as SwimUnitKey] = log.stufe;
      byDate.set(label, entry);
    }
    return Array.from(byDate.values());
  }, [allSwimLogs]);

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Trainingsplan</h1>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Wochenplan
        </h2>
        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li>🏋️ 3× Ganzkörper-Krafttraining pro Woche (Übungen unten eintragen)</li>
          <li>🏊 2× Cardio (Schwimmen) pro Woche</li>
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {SWIM_PLAN.title}
          </h2>
          <p className="text-xs text-zinc-500">{SWIM_PLAN.goal}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SWIM_PLAN.units.map((unit) => (
            <div
              key={unit.key}
              className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4"
            >
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{unit.label}</div>
                <div className="text-xs text-zinc-500">{unit.subtitle}</div>
              </div>
              <ol className="list-decimal space-y-1 pl-4 text-xs text-zinc-700 dark:text-zinc-300">
                {unit.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {unit.note && <p className="text-xs italic text-zinc-500">{unit.note}</p>}
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{unit.total}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[500px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                {SWIM_PLAN.stufenTable.headers.map((h, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SWIM_PLAN.stufenTable.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-2 py-1.5 ${j === 0 ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"} ${j === row.length - 1 ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-2 py-1.5 text-xs text-zinc-500">{SWIM_PLAN.stufenTable.note}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-xs">
            <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Atemrhythmen</h3>
            {SWIM_PLAN.atemrhythmen.map((a) => (
              <p key={a.key} className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{a.key}</span> = {a.desc}
              </p>
            ))}
          </div>
          <div className="space-y-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-xs">
            <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Technik-Check</h3>
            <ul className="list-disc space-y-0.5 pl-4 text-zinc-600 dark:text-zinc-400">
              {SWIM_PLAN.technikCheck.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-zinc-500">{SWIM_PLAN.protocolNote}</p>

        <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Wochenprotokoll – {weekdayLabelDE(isoDay)}, {formatDisplayDate(dateObj)}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {SWIM_PLAN.units.map((unit) => {
              const log = swimLogsForDate.find((l) => l.unit === unit.key);
              return (
                <SwimLogInputs
                  key={unit.key}
                  label={unit.label}
                  defaultStufe={log?.stufe?.toString() ?? ""}
                  defaultGefuehl={log?.gefuehl?.toString() ?? ""}
                  defaultNotiz={log?.notiz ?? ""}
                  onSave={(stufe, gefuehl, notiz) => saveSwimLog(unit.key, stufe, gefuehl, notiz)}
                />
              );
            })}
          </div>

          {swimHistory.length > 0 && (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={swimHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[1, 5]} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="tempo" name="A · Tempo" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="ausdauer" name="B · Ausdauer" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Übungen eintragen
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/training?date=${prevDate}`} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              ← {" "}
            </Link>
            <span className="text-zinc-700 dark:text-zinc-300">
              {weekdayLabelDE(isoDay)}, {formatDisplayDate(dateObj)}
            </span>
            <Link href={`/training?date=${nextDate}`} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              →
            </Link>
          </div>
        </div>

        <form
          action={(fd) => addExercise(fd)}
          className="flex gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
        >
          <input
            name="name"
            placeholder="Neue Übung (z.B. Kniebeuge)"
            required
            className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </form>

        <div className="space-y-4">
          {exercises.map((exercise) => {
            const log = logsForDate.find((l) => l.exercise_id === exercise.id);
            const history = allLogs
              .filter((l) => l.exercise_id === exercise.id)
              .map((l) => ({
                date: formatDisplayDate(parseDateOnly(l.date)),
                weight: l.weight,
                reps: l.reps,
              }));

            return (
              <div
                key={exercise.id}
                className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    defaultValue={exercise.name}
                    onBlur={(e) => e.target.value !== exercise.name && renameExercise(exercise.id, e.target.value)}
                    className="flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700"
                  />
                  <button
                    onClick={() => archiveExercise(exercise.id)}
                    className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Archivieren
                  </button>
                </div>

                <ExerciseLogInputs
                  defaultWeight={log?.weight?.toString() ?? ""}
                  defaultReps={log?.reps?.toString() ?? ""}
                  onSave={(weight, reps) => saveLog(exercise.id, weight, reps)}
                />

                {history.length > 0 ? (
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} unit=" kg" />
                        <Tooltip formatter={(value, name) => (name === "weight" ? `${value} kg` : value)} />
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Noch keine Einträge für diese Übung.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ExerciseLogInputs({
  defaultWeight,
  defaultReps,
  onSave,
}: {
  defaultWeight: string;
  defaultReps: string;
  onSave: (weight: string, reps: string) => void;
}) {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-zinc-500">Gewicht (kg)</label>
      <input
        type="number"
        step="0.5"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => onSave(weight, reps)}
        className="w-20 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
      />
      <label className="text-zinc-500">Wiederholungen</label>
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => onSave(weight, reps)}
        className="w-16 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
      />
    </div>
  );
}

function SwimLogInputs({
  label,
  defaultStufe,
  defaultGefuehl,
  defaultNotiz,
  onSave,
}: {
  label: string;
  defaultStufe: string;
  defaultGefuehl: string;
  defaultNotiz: string;
  onSave: (stufe: string, gefuehl: string, notiz: string) => void;
}) {
  const [stufe, setStufe] = useState(defaultStufe);
  const [gefuehl, setGefuehl] = useState(defaultGefuehl);
  const [notiz, setNotiz] = useState(defaultNotiz);

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 dark:border-zinc-800 p-2">
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="text-zinc-500">Stufe</label>
        <select
          value={stufe}
          onChange={(e) => {
            setStufe(e.target.value);
            onSave(e.target.value, gefuehl, notiz);
          }}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-1.5 py-1"
        >
          <option value="">–</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="text-zinc-500">Gefühl</label>
        <input
          type="number"
          min={1}
          max={10}
          value={gefuehl}
          onChange={(e) => setGefuehl(e.target.value)}
          onBlur={() => onSave(stufe, gefuehl, notiz)}
          className="w-12 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-1.5 py-1"
        />
      </div>
      <input
        placeholder="Notiz"
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        onBlur={() => onSave(stufe, gefuehl, notiz)}
        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-1.5 py-1 text-xs"
      />
    </div>
  );
}
