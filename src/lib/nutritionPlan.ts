export const NUTRITION_PLAN = {
  title: "Lean Bulk · 9. Nov 2026 – 30. Apr 2027 · 88 kg auf 91 kg",
  goal: "2 große Mahlzeiten + 1 Kohlenhydrat-Snack · jede Woche gleich",
  macros: { kcal: 2900, protein: 170, carbs: 400, fat: 70 },
  dailyStructure: [
    {
      key: "mittag",
      label: "Mittagessen",
      time: "12–13 Uhr",
      kcal: 1150,
      desc: "Große Portion Kohlenhydrate + 250 g Protein + Gemüse + Dessert: 150 g Magerquark mit 1 TL Honig.",
    },
    {
      key: "snack",
      label: "Gym-Snack",
      time: "30–60 min vor dem Training",
      kcal: 380,
      desc: "1 Banane, 5 Datteln, 1 EL Honig, 4 Reiswaffeln (ca. 90 g Kohlenhydrate). Nur an Trainings-, Schwimm- und Sauna-Tagen (Mo, Di, Do, Sa, So). An reinen Ruhetagen (Mi, Fr) entfällt der Snack.",
    },
    {
      key: "abend",
      label: "Abendessen",
      time: "18–19 Uhr / nach dem Training",
      kcal: 1150,
      desc: "Große Portion Kohlenhydrate + 250 g Protein + Gemüse + Dessert: 150 g Magerquark mit 1 TL Honig. Danach keine weitere Mahlzeit.",
    },
  ],
  portionRules: [
    {
      baustein: "Kohlenhydrate",
      menge: "175 g Naturreis (roh)",
      austausch: "175 g Nudeln · 175 g Buchweizen · 750 g Kartoffeln · 3 Protein-Wraps",
    },
    {
      baustein: "Protein",
      menge: "250 g Hähnchenbrust",
      austausch:
        "250 g Hack 5 % · 250 g Kabeljau · 180 g Naturlachs · 200 g Seitan · 200 g Veggie-Hack · 1 Dose Thunfisch + 50 g Feta · 7 Eier",
    },
    {
      baustein: "Gemüse",
      menge: "300–400 g",
      austausch: "Gurke, Tomate, Zucchini, Kaisergemüse, Paprika, Aubergine, Karotte, Blattgemüse",
    },
    { baustein: "Fett", menge: "max. 1 EL Olivenöl", austausch: "1 Handvoll Nüsse · 30–50 g Feta" },
    {
      baustein: "Dessert",
      menge: "150 g Magerquark + 1 TL Honig",
      austausch: "Obst dazu ist jederzeit ok",
    },
  ],
  weekPlan: [
    {
      day: "Mo",
      activity: "Sauna",
      mittag: "Crispy Tonno Feta Rice Bowl",
      abend: "Spaghetti Bolognese",
      snack: true,
    },
    {
      day: "Di",
      activity: "Kraft A",
      mittag: "Korean BBQ Chicken mit Reis",
      abend: "Ofengemüse-Sauce mit Rinderbällchen & Reis",
      snack: true,
    },
    {
      day: "Mi",
      activity: "Ruhetag",
      mittag: "Rührei-Kartoffel-Pfanne mit Feta & Tomaten",
      abend: "Protein-Wraps mit Veggie-Hack & Röstzwiebeln",
      snack: false,
    },
    {
      day: "Do",
      activity: "Kraft B",
      mittag: "Seitan-Soja-Reis-Bowl",
      abend: "Kabeljau oder Naturlachs mit Kartoffeln & Kaisergemüse",
      snack: true,
    },
    {
      day: "Fr",
      activity: "Ruhetag",
      mittag: "Zucchinischiffe mit Veggie-Hack & Käse + Buchweizen",
      abend: "Flammkuchen auf Protein-Wrap + Fetasalat",
      snack: false,
    },
    {
      day: "Sa",
      activity: "Kraft C",
      mittag: "Spaghetti Bolognese",
      abend: "Korean BBQ Chicken mit Reis",
      snack: true,
    },
    {
      day: "So",
      activity: "Schwimmen",
      mittag: "Thunfisch-Reis mit Kaisergemüse",
      abend: "McDonald's (Menü + Cola Zero)",
      snack: true,
    },
  ],
  recipes: [
    {
      name: "Crispy Tonno Feta Rice Bowl",
      zutaten:
        "175 g Naturreis, 1 Dose Thunfisch natur, 50 g Feta, Gurke, Tomate, 1 EL Sojasauce · Dressing: 100 g Magerquark, Knoblauch, Salz",
      kcal: 1020,
      protein: 70,
    },
    {
      name: "Spaghetti Bolognese",
      zutaten: "175 g Spaghetti, 250 g Hack 5 %, 200 g Tomatensauce, Karotte, Zwiebel, Knoblauch",
      kcal: 1040,
      protein: 75,
    },
    {
      name: "Korean BBQ Chicken",
      zutaten: "175 g Naturreis, 250 g Hähnchenbrust, 2 EL Korean-BBQ-Sauce, Zucchini, Paprika, 1 TL Öl",
      kcal: 1050,
      protein: 73,
    },
    {
      name: "Ofengemüse-Sauce mit Rinderbällchen",
      zutaten:
        "Tomate, Karotte, Aubergine, Paprika (ca. 400 g) im Ofen rösten, mit etwas Wasser mixen · 250 g Hack 5 % als Bällchen · 175 g Naturreis · 1 EL Olivenöl",
      kcal: 1130,
      protein: 75,
    },
    {
      name: "Rührei-Kartoffel-Pfanne",
      zutaten:
        "7 Eier als Rührei, 750 g Kartoffeln (gekocht, angebraten), Tomaten, Blattgemüse, 30 g Feta, 1 TL Öl",
      kcal: 1060,
      protein: 62,
    },
    {
      name: "Protein-Wraps mit Röstzwiebeln",
      zutaten:
        "3 Protein-Wraps, 200 g Veggie-Hack, Tomate, Gurke, Salat, 2 EL Röstzwiebeln · Sauce: 100 g Magerquark, Kräuter",
      kcal: 960,
      protein: 85,
    },
    {
      name: "Seitan-Soja-Reis-Bowl",
      zutaten: "175 g Naturreis, 200 g Seitan, 2 EL Sojasauce, Gurke, Tomate, Zucchini, 1 EL Öl",
      kcal: 1010,
      protein: 65,
    },
    {
      name: "Fisch mit Kartoffeln & Kaisergemüse",
      zutaten: "250 g Kabeljau (oder 180 g Naturlachs), 750 g Kartoffeln, 300 g Kaisergemüse, 1 EL Olivenöl",
      kcal: 1000,
      protein: 60,
    },
    {
      name: "Zucchinischiffe + Buchweizen",
      zutaten:
        "2 große Zucchini aushöhlen, füllen mit 200 g Veggie-Hack, 150 g Tomatensauce, 40 g Käse überbacken · 150 g Buchweizen dazu",
      kcal: 1100,
      protein: 70,
    },
    {
      name: "Flammkuchen auf Protein-Wrap",
      zutaten:
        "3 Protein-Wraps mit 150 g Magerquark bestreichen, Zwiebeln, 150 g Hähnchen, Ofen 8 min · Fetasalat: Gurke, Tomate, 30 g Feta, 1 TL Öl",
      kcal: 950,
      protein: 75,
    },
    {
      name: "Thunfisch-Reis mit Kaisergemüse",
      zutaten: "175 g Naturreis, 1 Dose Thunfisch, 300 g Kaisergemüse, 1 EL Sojasauce, 1 EL Öl",
      kcal: 960,
      protein: 55,
    },
    {
      name: "Gym-Snack",
      zutaten: "1 Banane, 5 Datteln, 1 EL Honig, 4 Reiswaffeln",
      kcal: 380,
      protein: 4,
    },
    {
      name: "Quark-Dessert",
      zutaten: "150 g Magerquark, 1 TL Honig (optional etwas Obst)",
      kcal: 125,
      protein: 18,
    },
  ],
  shoppingList: [
    {
      category: "Protein",
      items: [
        { key: "protein_hackfleisch", label: "Hackfleisch 5 % (Rind)", amount: "750 g" },
        { key: "protein_haehnchenbrust", label: "Hähnchenbrust", amount: "650 g" },
        { key: "protein_veggiehack", label: "Veggie-Hack", amount: "400 g" },
        { key: "protein_seitan", label: "Seitan", amount: "200 g" },
        { key: "protein_fisch", label: "Kabeljau / Forelle / Naturlachs", amount: "250 g" },
        { key: "protein_thunfisch", label: "Thunfisch natur (Dose)", amount: "2 Dosen" },
        { key: "protein_eier", label: "Eier", amount: "10er Packung" },
        { key: "protein_magerquark", label: "Magerquark", amount: "5 × 500 g" },
        { key: "protein_feta", label: "Feta", amount: "200 g" },
        { key: "protein_kaese", label: "Geriebener Käse", amount: "40 g" },
      ],
    },
    {
      category: "Kohlenhydrate",
      items: [
        { key: "carbs_reis", label: "Naturreis", amount: "1,1 kg" },
        { key: "carbs_nudeln", label: "Nudeln", amount: "350 g" },
        { key: "carbs_buchweizen", label: "Buchweizen", amount: "150 g" },
        { key: "carbs_kartoffeln", label: "Kartoffeln", amount: "1,5 kg" },
        { key: "carbs_wraps", label: "Protein-Wraps", amount: "6 Stück" },
        { key: "carbs_reiswaffeln", label: "Reiswaffeln", amount: "28 Stück" },
        { key: "carbs_bananen", label: "Bananen", amount: "7 Stück" },
        { key: "carbs_datteln", label: "Datteln", amount: "ca. 250 g" },
        { key: "carbs_honig", label: "Honig", amount: "1 Glas (2 Wochen)" },
        { key: "carbs_haferflocken", label: "Haferflocken (Reserve)", amount: "optional" },
      ],
    },
    {
      category: "Gemüse & Obst",
      items: [
        { key: "gemuese_tomaten", label: "Tomaten", amount: "1 kg" },
        { key: "gemuese_gurken", label: "Gurken", amount: "2 Stück" },
        { key: "gemuese_zucchini", label: "Zucchini", amount: "4 Stück" },
        { key: "gemuese_paprika", label: "Paprika", amount: "3 Stück" },
        { key: "gemuese_aubergine", label: "Aubergine", amount: "1 Stück" },
        { key: "gemuese_karotten", label: "Karotten", amount: "500 g" },
        { key: "gemuese_kaisergemuese", label: "Kaisergemüse (TK)", amount: "1 kg" },
        { key: "gemuese_blattgemuese", label: "Blattgemüse / Salat", amount: "1–2 Packungen" },
        { key: "gemuese_zwiebeln", label: "Zwiebeln & Knoblauch", amount: "1 Netz / 1 Knolle" },
        { key: "gemuese_obst", label: "Obst nach Lust", amount: "optional" },
      ],
    },
    {
      category: "Vorrat & Saucen",
      items: [
        { key: "vorrat_tomatensauce", label: "Tomatensauce / Passata", amount: "2 × 500 g" },
        { key: "vorrat_sojasauce", label: "Sojasauce", amount: "1 Flasche" },
        { key: "vorrat_bbqsauce", label: "Korean-BBQ-Sauce", amount: "1 Flasche" },
        { key: "vorrat_roestzwiebeln", label: "Röstzwiebeln", amount: "1 Packung" },
        { key: "vorrat_olivenoel", label: "Olivenöl", amount: "1 Flasche" },
        { key: "vorrat_nuesse", label: "Nüsse (Auswechselbank)", amount: "optional" },
        { key: "vorrat_huelsenfruechte", label: "Hülsenfrüchte (ab und zu)", amount: "optional" },
        { key: "vorrat_cola", label: "Cola Zero / Wasser", amount: "nach Bedarf" },
        { key: "vorrat_gewuerze", label: "Salz, Pfeffer, Kräuter", amount: "Vorrat" },
      ],
    },
  ],
  notes: [
    "Sauna-Tag: viel trinken und eine Prise extra Salz ans Essen.",
    "McDonald's 1× pro Woche eingeplant (So-Abend) – dazu Cola Zero, dann passt es in die Kalorien.",
    "Anpassung alle 2 Wochen nach Wochendurchschnitt: Ø-Gewicht unter dem Korridor → +40 g Reis/Tag · im Korridor → nichts ändern · über dem Korridor oder Bauchumfang wächst → −40 g Reis/Tag.",
    "Meal Prep: Sonntag und Mittwoch Reis, Kartoffeln und Rinderbällchen für 2–3 Tage vorkochen. Gekochter Reis hält im Kühlschrank 2–3 Tage.",
    "Wenn die Kalorien erhöht werden (+40 g Reis/Tag): rund 300 g Naturreis pro Woche mehr einkaufen.",
  ],
};

export type ShoppingItemKey = (typeof NUTRITION_PLAN.shoppingList)[number]["items"][number]["key"];
