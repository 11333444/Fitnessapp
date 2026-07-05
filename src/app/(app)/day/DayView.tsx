"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { dayProgress, currentStreak } from "@/lib/progress";
import { parseDateOnly, weekdayLabelDE, isoWeekday, formatDisplayDate } from "@/lib/dates";
import { ProgressBar } from "@/components/ProgressBar";

type Habit = Tables<"habits">;
type HabitLog = Tables<"habit_logs">;
type DailyEntry = Tables<"daily_entries">;
type Workout = Tables<"workouts">;
type MealPhoto = Tables<"meal_photos"> & { url: string | null };

const WORKOUT_TYPES: { value: string; label: string }[] = [
  { value: "rest", label: "Rest Day" },
  { value: "swimming", label: "Schwimmen" },
  { value: "running", label: "Laufen" },
  { value: "cycling", label: "Rennrad" },
  { value: "strength", label: "Krafttraining" },
];

const MEAL_LABELS: { value: string; label: string }[] = [
  { value: "breakfast", label: "Frühstück" },
  { value: "lunch", label: "Mittag" },
  { value: "dinner", label: "Abend" },
  { value: "snack", label: "Snack" },
];

export function DayView({
  date,
  prevDate,
  nextDate,
  habits,
  logs,
  dailyEntry,
  workouts,
  mealPhotos,
  isSunday,
  weekSundayDate,
  weekly,
}: {
  date: string;
  prevDate: string;
  nextDate: string;
  habits: Habit[];
  logs: HabitLog[];
  dailyEntry: DailyEntry | null;
  workouts: Workout[];
  mealPhotos: MealPhoto[];
  isSunday: boolean;
  weekSundayDate: string;
  weekly: { weight: number | null; formCheckUrls: string[] } | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const dateObj = useMemo(() => parseDateOnly(date), [date]);
  const isoDay = isoWeekday(dateObj);

  const [note, setNote] = useState(dailyEntry?.note ?? "");
  const [noLimitJournal, setNoLimitJournal] = useState(dailyEntry?.no_limit_journal ?? "");
  const [gratitudeJournal, setGratitudeJournal] = useState(dailyEntry?.gratitude_journal ?? "");
  const [weight, setWeight] = useState(weekly?.weight?.toString() ?? "");
  const [busy, setBusy] = useState(false);

  const applicableHabits = habits.filter((h) => h.active_weekdays.includes(isoDay));
  const progress = dayProgress(habits, logs, dateObj);
  const habitsByCategory = groupByCategory(applicableHabits);

  async function toggleHabit(habit: Habit, completed: boolean) {
    setBusy(true);
    await supabase
      .from("habit_logs")
      .upsert({ habit_id: habit.id, date, completed }, { onConflict: "habit_id,date" });
    setBusy(false);
    router.refresh();
  }

  async function saveJournalField(
    field: "note" | "no_limit_journal" | "gratitude_journal",
    value: string,
  ) {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const patch: TablesInsert<"daily_entries"> = { user_id: userData.user.id, date };
    if (field === "note") patch.note = value;
    if (field === "no_limit_journal") patch.no_limit_journal = value;
    if (field === "gratitude_journal") patch.gratitude_journal = value;

    await supabase.from("daily_entries").upsert(patch, { onConflict: "user_id,date" });

    const linkedHabit = habits.find((h) => h.linked_field === field);
    if (linkedHabit) {
      await supabase.from("habit_logs").upsert(
        { habit_id: linkedHabit.id, date, completed: value.trim().length > 0 },
        { onConflict: "habit_id,date" },
      );
    }

    setBusy(false);
    router.refresh();
  }

  async function toggleWorkout(type: string) {
    setBusy(true);
    const existing = workouts.find((w) => w.type === type);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (existing) {
      await supabase.from("workouts").delete().eq("id", existing.id);
    } else {
      await supabase.from("workouts").insert({ user_id: userData.user.id, date, type });
    }
    setBusy(false);
    router.refresh();
  }

  async function handleMealPhotoUpload(file: File, mealLabel: string | null) {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const path = `${userData.user.id}/${date}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("meal-photos").upload(path, file);
    if (!uploadError) {
      await supabase.from("meal_photos").insert({
        user_id: userData.user.id,
        date,
        photo_path: path,
        meal_label: mealLabel,
      });
    }
    setBusy(false);
    router.refresh();
  }

  async function saveWeight() {
    const numeric = Number(weight.replace(",", "."));
    if (Number.isNaN(numeric)) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("weight_entries").upsert(
      { user_id: userData.user.id, week_start_date: date, weight: numeric },
      { onConflict: "user_id,week_start_date" },
    );
    setBusy(false);
    router.refresh();
  }

  async function handleFormCheckUpload(file: File) {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const path = `${userData.user.id}/${date}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("form-checks").upload(path, file);

    if (!uploadError) {
      const { data: existing } = await supabase
        .from("form_checks")
        .select("photo_paths")
        .eq("user_id", userData.user.id)
        .eq("week_start_date", date)
        .maybeSingle();

      const newPaths = [...(existing?.photo_paths ?? []), path];
      await supabase.from("form_checks").upsert(
        { user_id: userData.user.id, week_start_date: date, photo_paths: newPaths },
        { onConflict: "user_id,week_start_date" },
      );
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href={`/day?date=${prevDate}`}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ← Vorheriger Tag
        </Link>
        <div className="text-center">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {weekdayLabelDE(isoDay)}, {formatDisplayDate(dateObj)}
          </div>
          <Link
            href={`/week?date=${date}`}
            className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Zur Wochenansicht
          </Link>
        </div>
        <Link
          href={`/day?date=${nextDate}`}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Nächster Tag →
        </Link>
      </div>

      <ProgressBar
        label="Tagesfortschritt"
        completed={progress.completed}
        total={progress.total}
        percent={progress.percent}
      />

      <section className="space-y-4">
        {Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
          <div key={category} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {category}
            </h2>
            <div className="space-y-1.5">
              {categoryHabits.map((habit) => {
                const log = logs.find((l) => l.habit_id === habit.id);
                const completed = log?.completed ?? false;
                const streak = currentStreak(habit.id, logs, dateObj);
                return (
                  <label
                    key={habit.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={completed}
                        disabled={busy}
                        onChange={(e) => toggleHabit(habit, e.target.checked)}
                        className="h-5 w-5 rounded accent-emerald-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {habit.name}
                        </div>
                        {habit.type === "numeric" && habit.target_value && (
                          <div className="text-xs text-zinc-500">
                            Ziel: {habit.target_value} {habit.unit}
                          </div>
                        )}
                      </div>
                    </div>
                    {streak > 1 && (
                      <span className="whitespace-nowrap rounded-full bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                        🔥 {streak}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Training</h2>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_TYPES.map((wt) => {
            const active = workouts.some((w) => w.type === wt.value);
            return (
              <button
                key={wt.value}
                onClick={() => toggleWorkout(wt.value)}
                disabled={busy}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {wt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Journal</h2>
        <JournalField label="Tagesreflektion" value={note} onChange={setNote} onSave={() => saveJournalField("note", note)} />
        <JournalField
          label="No Limit Thinking & Journaling"
          value={noLimitJournal}
          onChange={setNoLimitJournal}
          onSave={() => saveJournalField("no_limit_journal", noLimitJournal)}
        />
        <JournalField
          label="Dankbarkeit"
          value={gratitudeJournal}
          onChange={setGratitudeJournal}
          onSave={() => saveJournalField("gratitude_journal", gratitudeJournal)}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Essens-Bilder
        </h2>
        <MealPhotoUploader onUpload={handleMealPhotoUpload} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {mealPhotos.map((photo) =>
            photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.meal_label ?? "Essen"}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ) : null,
          )}
        </div>
      </section>

      {isSunday && (
        <section className="space-y-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Formcheck & Gewicht (nur sonntags, Woche {formatDisplayDate(parseDateOnly(weekSundayDate))})
          </h2>

          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Gewicht (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={saveWeight}
              className="w-24 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFormCheckUpload(e.target.files[0])}
              className="text-sm"
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {weekly?.formCheckUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="Formcheck" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function groupByCategory(habits: Habit[]): Record<string, Habit[]> {
  const groups: Record<string, Habit[]> = {};
  for (const habit of habits) {
    const key = habit.category ?? "Sonstiges";
    if (!groups[key]) groups[key] = [];
    groups[key].push(habit);
  }
  return groups;
}

function JournalField({
  label,
  value,
  onChange,
  onSave,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        rows={2}
        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50"
      />
    </div>
  );
}

function MealPhotoUploader({
  onUpload,
}: {
  onUpload: (file: File, mealLabel: string | null) => void;
}) {
  const [mealLabel, setMealLabel] = useState<string>("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={mealLabel}
        onChange={(e) => setMealLabel(e.target.value)}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-sm"
      >
        <option value="">Kein Label</option>
        {MEAL_LABELS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file, mealLabel || null);
          e.target.value = "";
        }}
        className="text-sm"
      />
    </div>
  );
}
