export type ScaleLevel = {
  score: number;
  category: string;
  range: string;
  interpretation: string;
};

export const SPO2_SCALE: Record<number, ScaleLevel> = {
  1: {
    score: 1,
    category: "Gravemente comprometido",
    range: "<85%",
    interpretation:
      "La SpO₂ se encuentra en un rango gravemente comprometido.",
  },
  2: {
    score: 2,
    category: "Sustancialmente comprometido",
    range: "85–87%",
    interpretation:
      "La SpO₂ se encuentra en un rango sustancialmente comprometido.",
  },
  3: {
    score: 3,
    category: "Moderadamente comprometido",
    range: "88–89%",
    interpretation:
      "La SpO₂ se encuentra en un rango moderadamente comprometido.",
  },
  4: {
    score: 4,
    category: "Levemente comprometido",
    range: "90–92%",
    interpretation:
      "La SpO₂ se encuentra en un rango levemente comprometido.",
  },
  5: {
    score: 5,
    category: "No comprometido",
    range: "93–95%",
    interpretation:
      "La SpO₂ se encuentra en un rango no comprometido.",
  },
};

export function getSpo2Scale(value: number): ScaleLevel | null {
  if (!value || value < 1 || value > 5) return null;
  return SPO2_SCALE[value] ?? null;
}