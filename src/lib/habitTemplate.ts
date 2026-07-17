import type { TablesInsert } from "@/lib/supabase/database.types";

type HabitTemplateItem = Omit<TablesInsert<"habits">, "user_id" | "sort_order"> & {
  sort_order: number;
};

/** Standard-Set an Habits, das beim Anlegen eines neuen Users als Vorlage kopiert wird. */
export const HABIT_TEMPLATE: HabitTemplateItem[] = [
  { name: "Termine 2+", type: "numeric", target_value: 2, unit: "Termine", category: "Produktivität", sort_order: 0 },
  { name: "unter 50€ ausgeben", type: "numeric", target_value: 50, unit: "€", category: "Finanzen", sort_order: 1 },
  { name: "30min Podcast / Lange o. Graf / Mindset", type: "numeric", target_value: 30, unit: "Min", category: "Mindset", sort_order: 2 },
  { name: "180g Protein", type: "numeric", target_value: 180, unit: "g", category: "Ernährung", sort_order: 3 },
  { name: "Bauernhof essen", type: "boolean", category: "Ernährung", sort_order: 4 },
  { name: "8.000 Schritte", type: "numeric", target_value: 8000, unit: "Schritte", category: "Fitness", sort_order: 5 },
  { name: "In den Haaren fummeln", type: "boolean", category: "Ticks", sort_order: 6 },
  { name: "6h produktiv arbeiten / lernen", type: "numeric", target_value: 6, unit: "h", category: "Produktivität", sort_order: 7 },
  { name: "wirklicher Fortschritt ja / nein", type: "boolean", category: "Produktivität", sort_order: 8 },
  { name: "no limit thinking and journaling", type: "boolean", category: "Mindset", linked_field: "no_limit_journal", sort_order: 9 },
  { name: "Makroziele erreicht", type: "boolean", category: "Ernährung", sort_order: 10 },
  { name: "5 Seiten lesen", type: "numeric", target_value: 5, unit: "Seiten", category: "Mindset", sort_order: 11 },
  { name: "Tagesreflektion", type: "boolean", category: "Mindset", linked_field: "note", sort_order: 12 },
  { name: "Liegestütze", type: "numeric", target_value: 50, unit: "Wiederholungen", category: "Fitness", sort_order: 13 },
  { name: "Dankbarkeit", type: "boolean", category: "Mindset", linked_field: "gratitude_journal", sort_order: 14 },
];
