export const SWIM_PLAN = {
  title: "Schwimmplan Kraul · 2× 2.000 m pro Woche",
  goal: "Ziel: 1.000 m in 15:00 (1:30/100 m) · Nur Kraul normal + Pullbuoy · Wechselnde Atemrhythmen",
  units: [
    {
      key: "tempo" as const,
      label: "A · Tempo",
      subtitle: "Schnelligkeit · Tag 1 der Woche",
      steps: [
        "300 locker einschwimmen · 3er-Atmung",
        "4 × 100 Pullbuoy gleichmäßig · 20 s Pause · 50 m 3er / 50 m 5er",
        "8 × 50 zügig · 30 s Pause · 2er-Atmung",
        "4 × 100 zügig · 30 s Pause · 3er-Atmung",
        "8 × 25 SPRINT · 30 s Pause · 4er-Atmung",
        "200 Pullbuoy locker · 5er-Atmung",
        "100 locker ausschwimmen · beliebig",
      ],
      note: null as string | null,
      total: "= 2.000 m",
    },
    {
      key: "ausdauer" as const,
      label: "B · Ausdauer",
      subtitle: "Durchhalten · Tag 2 der Woche",
      steps: [
        "300 locker einschwimmen · 3er-Atmung",
        "400 gleichmäßig · 3er-Atmung · danach 45 s Pause",
        "400 gleichmäßig · 4er-Atmung · danach 45 s Pause",
        "400 Pullbuoy gleichmäßig · 3er-Atmung · 45 s Pause",
        "4 × 100 Pullbuoy · 20 s Pause · je 100: 3er / 5er / 3er / 5er",
        "100 locker ausschwimmen · beliebig",
      ],
      note: "Ab Stufe 3: 3×400 ersetzen durch 1.200 am Stück (3er)",
      total: "= 2.000 m",
    },
  ],
  stufenTable: {
    headers: ["", "1", "2", "3", "4", "5", "Ziel"],
    rows: [
      ["Gleichmäßig / Pullbuoy", "2:30", "2:15", "2:05", "1:55", "1:45", "1:38"],
      ["Zügig (100er)", "2:20", "2:05", "1:55", "1:45", "1:37", "1:30"],
      ["Zügig (50er)", "1:08", "1:01", "0:56", "0:51", "0:47", "0:43"],
      ["1.000 m Test", "24:00", "21:30", "19:30", "17:45", "16:15", "15:00"],
    ],
    note: "Aufsteigen, wenn du 2 Einheiten in Folge alle Zeiten schaffst.",
  },
  atemrhythmen: [
    { key: "2er", desc: "jeden 2. Zug, immer gleiche Seite – max. Luft für Tempo" },
    { key: "3er", desc: "jeden 3. Zug, Seite wechselt – gleichmäßiger Zug, Standard" },
    { key: "4er", desc: "jeden 4. Zug, gleiche Seite – Atemkontrolle" },
    { key: "5er", desc: "jeden 5. Zug, Seite wechselt – Lungenkraft, ruhig bleiben" },
  ],
  technikCheck: [
    "Unter Wasser immer komplett ausatmen (Blubbern).",
    "Kopf ruhig, Blick zum Boden – beim Atmen nur drehen, nicht heben",
    "Arm vorne lang strecken, dann Hand + Unterarm ins Wasser „einhaken“",
    "Hoher Ellbogen unter Wasser, Zug bis zur Hüfte durchdrücken",
    "Körper rollt mit dem Zug von Seite zu Seite",
    "Beine locker aus der Hüfte, schmal, Füße gestreckt",
  ],
  protocolNote:
    "Alle 4 Wochen: Einheit B ersetzen durch 300 ein · 1.000 m auf Zeit · 700 locker Pullbuoy",
};

export type SwimUnitKey = (typeof SWIM_PLAN.units)[number]["key"];
