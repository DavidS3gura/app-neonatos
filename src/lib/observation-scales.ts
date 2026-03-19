export interface ScaleLevel {
  score: number;
  category: string;
  range: string;
  interpretation: string;
}

export const POSICION_COMODA_SCALE: Record<number, ScaleLevel> = {
  1: {
    score: 1,
    category: 'Gravemente comprometido',
    range: 'Predominio persistente de signos de estrés',
    interpretation:
      'Predominio persistente de signos de estrés: extensión o hipotonía de extremidades, separación de dedos, boca abierta, movimientos continuos y desorganizados, sin conductas de autorregulación.',
  },
  2: {
    score: 2,
    category: 'Sustancialmente comprometido',
    range: 'Varios signos de estrés la mayor parte del tiempo',
    interpretation:
      'Varios signos de estrés durante la mayor parte de la observación; flexión escasa; manos rara vez hacia cara o boca; tono poco organizado.',
  },
  3: {
    score: 3,
    category: 'Moderadamente comprometido',
    range: 'Alterna comodidad y estrés',
    interpretation:
      'Alterna signos de comodidad y estrés; mantiene flexión parcial; mano a cara o boca solo de manera ocasional; desorganización motora intermitente.',
  },
  4: {
    score: 4,
    category: 'Levemente comprometido',
    range: 'Predominan signos de autorregulación',
    interpretation:
      'Predominan signos de autorregulación; postura flexionada la mayor parte del tiempo; mano a cara o boca frecuente; pocos signos de estrés, leves y transitorios.',
  },
  5: {
    score: 5,
    category: 'No comprometido',
    range: 'Postura flexionada o recogida mantenida',
    interpretation:
      'Postura flexionada o recogida mantenida; manos hacia cara o boca; succión presente; tono y postura relajados; ausencia o mínima presencia de signos de estrés.',
  },
};

export const SPO2_SCALE: Record<number, ScaleLevel> = {
  1: {
    score: 1,
    category: 'Gravemente comprometido',
    range: '<85%',
    interpretation:
      'La SpO₂ se encuentra en un rango gravemente comprometido.',
  },
  2: {
    score: 2,
    category: 'Sustancialmente comprometido',
    range: '85–87%',
    interpretation:
      'La SpO₂ se encuentra en un rango sustancialmente comprometido.',
  },
  3: {
    score: 3,
    category: 'Moderadamente comprometido',
    range: '88–89%',
    interpretation:
      'La SpO₂ se encuentra en un rango moderadamente comprometido.',
  },
  4: {
    score: 4,
    category: 'Levemente comprometido',
    range: '90–92%',
    interpretation:
      'La SpO₂ se encuentra en un rango levemente comprometido.',
  },
  5: {
    score: 5,
    category: 'No comprometido',
    range: '93–95%',
    interpretation:
      'La SpO₂ se encuentra en un rango no comprometido.',
  },
};

export const FR_SCALE: Record<number, ScaleLevel> = {
  1: {
    score: 1,
    category: 'Gravemente comprometido',
    range: '≤25 o >80 / apnea',
    interpretation:
      'La frecuencia respiratoria se encuentra gravemente comprometida: ≤25 o >80 rpm, o presencia de apnea.',
  },
  2: {
    score: 2,
    category: 'Sustancialmente comprometido',
    range: '26–30 o 71–80',
    interpretation:
      'La frecuencia respiratoria se encuentra en un rango sustancialmente comprometido: 26–30 o 71–80 rpm.',
  },
  3: {
    score: 3,
    category: 'Moderadamente comprometido',
    range: '31–35 o 66–70',
    interpretation:
      'La frecuencia respiratoria se encuentra en un rango moderadamente comprometido: 31–35 o 66–70 rpm.',
  },
  4: {
    score: 4,
    category: 'Levemente comprometido',
    range: '36–39 o 61–65',
    interpretation:
      'La frecuencia respiratoria se encuentra en un rango levemente comprometido: 36–39 o 61–65 rpm.',
  },
  5: {
    score: 5,
    category: 'No comprometido',
    range: '40–60',
    interpretation:
      'La frecuencia respiratoria se encuentra en un rango no comprometido: 40–60 rpm.',
  },
};

export const FC_SCALE: Record<number, ScaleLevel> = {
  1: {
    score: 1,
    category: 'Gravemente comprometido',
    range: '<100 o >185',
    interpretation:
      'La frecuencia cardíaca se encuentra gravemente comprometida: menor de 100 o mayor de 185 lpm.',
  },
  2: {
    score: 2,
    category: 'Sustancialmente comprometido',
    range: '100–114 o 176–185',
    interpretation:
      'La frecuencia cardíaca se encuentra en un rango sustancialmente comprometido: 100–114 o 176–185 lpm.',
  },
  3: {
    score: 3,
    category: 'Moderadamente comprometido',
    range: '115–129 o 166–175',
    interpretation:
      'La frecuencia cardíaca se encuentra en un rango moderadamente comprometido: 115–129 o 166–175 lpm.',
  },
  4: {
    score: 4,
    category: 'Levemente comprometido',
    range: '130–139 o 161–165',
    interpretation:
      'La frecuencia cardíaca se encuentra en un rango levemente comprometido: 130–139 o 161–165 lpm.',
  },
  5: {
    score: 5,
    category: 'No comprometido',
    range: '140–160',
    interpretation:
      'La frecuencia cardíaca se encuentra en un rango no comprometido: 140–160 lpm.',
  },
};

function getScaleValue(
  scale: Record<number, ScaleLevel>,
  value: number
): ScaleLevel | null {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 5) {
    return null;
  }

  return scale[numericValue] || null;
}

export function getPosicionComodaScale(value: number): ScaleLevel | null {
  return getScaleValue(POSICION_COMODA_SCALE, value);
}

export function getSpo2Scale(value: number): ScaleLevel | null {
  return getScaleValue(SPO2_SCALE, value);
}

export function getFrScale(value: number): ScaleLevel | null {
  return getScaleValue(FR_SCALE, value);
}

export function getFcScale(value: number): ScaleLevel | null {
  return getScaleValue(FC_SCALE, value);
}