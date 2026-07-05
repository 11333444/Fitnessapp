import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/** Tagesgrenzen laufen in UTC: "heute" = aktuelles UTC-Datum. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** ISO-Wochentag: 1 = Montag ... 7 = Sonntag. */
export function isoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

export function isSundayDate(date: string): boolean {
  return isoWeekday(parseDateOnly(date)) === 7;
}

/** Der Sonntag der Woche, in der `date` liegt (Woche = Mo-So). */
export function weekSunday(date: Date): Date {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return addDays(monday, 6);
}

export function weekDays(date: Date): Date[] {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: monday, end: addDays(monday, 6) });
}

export function monthDays(date: Date): Date[] {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
}

const WEEKDAY_LABELS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function weekdayLabelDE(isoDay: number): string {
  return WEEKDAY_LABELS_DE[isoDay - 1];
}

export function formatDisplayDate(date: Date): string {
  return format(date, "dd.MM.yyyy");
}
