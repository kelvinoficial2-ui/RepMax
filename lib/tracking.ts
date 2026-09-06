export function inputText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

export type Measurement = {
  id: string;
  month: string;
  weight: number;
  height: number;
  armLeft: number | null;
  armRight: number | null;
  forearmLeft: number | null;
  forearmRight: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
  chestRelaxed: number | null;
  chestInspired: number | null;
  waist: number | null;
  abdomen: number | null;
  hip: number | null;
  neck: number | null;
  shoulders: number | null;
  // Campos antigos permanecem opcionais para exibir avaliações já salvas.
  chest?: number | null;
  arm?: number | null;
  thigh?: number | null;
  calf?: number | null;
};
export const exerciseCategories = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Abdômen',
  'Outros',
] as const;
export type ExerciseCategory = (typeof exerciseCategories)[number];
export type Exercise = {
  id: string;
  name: string;
  equipment: string;
  category?: ExerciseCategory;
};
export type LoadEntry = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  equipment: string;
  basis: string;
  date: string;
  weight: number;
  sets: number;
  reps: number;
};
export const bases = [
  'kg por halter',
  'kg por lado',
  'kg total da barra',
  'kg indicado na máquina',
  'kg adicional',
  'kg total',
] as const;
export const measureFields = [
  ['weight', 'Peso', 'kg', 'Dados gerais', 'weight'],
  ['height', 'Altura', 'cm', 'Dados gerais', 'height'],
  ['armLeft', 'Braço esquerdo', 'cm', 'Membros superiores', 'armLeft'],
  ['armRight', 'Braço direito', 'cm', 'Membros superiores', 'armRight'],
  [
    'forearmLeft',
    'Antebraço esquerdo',
    'cm',
    'Membros superiores',
    'forearmLeft',
  ],
  [
    'forearmRight',
    'Antebraço direito',
    'cm',
    'Membros superiores',
    'forearmRight',
  ],
  ['thighLeft', 'Coxa esquerda', 'cm', 'Membros inferiores', 'thighLeft'],
  ['thighRight', 'Coxa direita', 'cm', 'Membros inferiores', 'thighRight'],
  ['calfLeft', 'Panturrilha esquerda', 'cm', 'Membros inferiores', 'calfLeft'],
  ['calfRight', 'Panturrilha direita', 'cm', 'Membros inferiores', 'calfRight'],
  ['chestRelaxed', 'Tórax relaxado', 'cm', 'Tronco', 'chest'],
  ['chestInspired', 'Tórax inspirado', 'cm', 'Tronco', 'chest'],
  ['waist', 'Cintura', 'cm', 'Tronco', 'waist'],
  ['abdomen', 'Abdômen', 'cm', 'Tronco', 'abdomen'],
  ['hip', 'Quadril', 'cm', 'Tronco', 'hip'],
  ['neck', 'Pescoço', 'cm', 'Outros', 'neck'],
  ['shoulders', 'Ombros', 'cm', 'Outros', 'shoulders'],
] as const;

const legacyMeasureKeys: Record<string, keyof Measurement> = {
  armRight: 'arm',
  thighRight: 'thigh',
  calfRight: 'calf',
  chestRelaxed: 'chest',
};

export function measurementValue(record: Measurement | undefined, key: string) {
  if (!record) return undefined;
  const value = record[key as keyof Measurement];
  if (typeof value === 'number' || value === null) return value;
  const legacyKey = legacyMeasureKeys[key];
  const legacyValue = legacyKey ? record[legacyKey] : undefined;
  return typeof legacyValue === 'number' || legacyValue === null
    ? legacyValue
    : undefined;
}
export const initialExercises: Exercise[] = [
  {
    id: 'supino-reto-halteres',
    name: 'Supino reto com halteres',
    equipment: 'Halteres',
    category: 'Peito',
  },
  {
    id: 'supino-reto-barra',
    name: 'Supino reto com barra',
    equipment: 'Barra e banco reto',
    category: 'Peito',
  },
  {
    id: 'supino-inclinado',
    name: 'Supino inclinado com halteres',
    equipment: 'Halteres',
    category: 'Peito',
  },
  {
    id: 'supino-inclinado-maquina-articulada',
    name: 'Supino inclinado na máquina articulada',
    equipment: 'Máquina articulada com anilhas',
    category: 'Peito',
  },
  {
    id: 'supino-declinado-maquina-articulada',
    name: 'Supino declinado na máquina articulada',
    equipment: 'Máquina articulada com anilhas',
    category: 'Peito',
  },
  {
    id: 'crucifixo',
    name: 'Crucifixo',
    equipment: 'Halteres',
    category: 'Peito',
  },
  {
    id: 'crucifixo-polia-alta',
    name: 'Crucifixo em pé na polia alta',
    equipment: 'Crossover / polia dupla',
    category: 'Peito',
  },
  {
    id: 'crucifixo-maquina-peck-deck',
    name: 'Crucifixo na máquina (peck deck)',
    equipment: 'Máquina peck deck',
    category: 'Peito',
  },
  {
    id: 'triceps-polia',
    name: 'Tríceps na polia com barra reta',
    equipment: 'Polia alta com barra reta',
    category: 'Tríceps',
  },
  {
    id: 'triceps-frances-unilateral-sentado-halter',
    name: 'Tríceps francês unilateral sentado com halter',
    equipment: 'Halter e banco',
    category: 'Tríceps',
  },
  {
    id: 'triceps-testa-declinado-halteres',
    name: 'Tríceps testa declinado com halteres',
    equipment: 'Halteres e banco declinado',
    category: 'Tríceps',
  },
  {
    id: 'triceps-testa-inclinado-barra-w',
    name: 'Tríceps testa no banco inclinado com barra W',
    equipment: 'Barra W e banco inclinado',
    category: 'Tríceps',
  },
  {
    id: 'encolhimento-halteres',
    name: 'Encolhimento com halteres',
    equipment: 'Halteres',
    category: 'Costas',
  },
  {
    id: 'barra-fixa-assistida-maquina',
    name: 'Barra fixa assistida na máquina',
    equipment: 'Máquina de barra fixa assistida (peso de auxílio)',
    category: 'Costas',
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação lateral em pé com halteres',
    equipment: 'Halteres',
    category: 'Ombros',
  },
  {
    id: 'elevacao-lateral-sentada',
    name: 'Elevação lateral sentada com halteres',
    equipment: 'Halteres e banco',
    category: 'Ombros',
  },
  {
    id: 'remada-alta-halteres',
    name: 'Remada alta com halteres',
    equipment: 'Halteres',
    category: 'Ombros',
  },
  {
    id: 'face-pull-polia-corda',
    name: 'Face pull na polia com corda',
    equipment: 'Polia alta com corda',
    category: 'Ombros',
  },
  {
    id: 'elevacao-frontal-anilha',
    name: 'Elevação frontal com anilha',
    equipment: 'Anilha',
    category: 'Ombros',
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira extensora',
    equipment: 'Cadeira extensora',
    category: 'Pernas',
  },
  {
    id: 'panturrilha-sentada-maquina',
    name: 'Panturrilha sentada na máquina',
    equipment: 'Máquina de panturrilha sentada',
    category: 'Pernas',
  },
  {
    id: 'avanco-frente-halteres',
    name: 'Avanço à frente com halteres',
    equipment: 'Halteres',
    category: 'Pernas',
  },
  {
    id: 'rosca-concentrada-halteres',
    name: 'Rosca concentrada com halter',
    equipment: 'Halter',
    category: 'Bíceps',
  },
  {
    id: 'rosca-inversa-barra-reta',
    name: 'Rosca inversa em pé com barra reta',
    equipment: 'Barra reta',
    category: 'Bíceps',
  },
  {
    id: 'rosca-martelo-polia-baixa-corda',
    name: 'Rosca martelo na polia baixa com corda',
    equipment: 'Polia baixa com corda',
    category: 'Bíceps',
  },
  {
    id: 'abdominal-polia-alta-em-pe',
    name: 'Abdominal em pé na polia alta',
    equipment: 'Polia alta com corda',
    category: 'Abdômen',
  },
  {
    id: 'abdominal-halter-bracos-estendidos',
    name: 'Abdominal com halter e braços estendidos',
    equipment: 'Halter',
    category: 'Abdômen',
  },
];
export function defaultLoadBasis(exercise: Exercise) {
  if (
    exercise.id === 'crucifixo-polia-alta' ||
    exercise.id === 'supino-inclinado-maquina-articulada' ||
    exercise.id === 'supino-declinado-maquina-articulada'
  )
    return bases[1];
  if (
    exercise.id === 'supino-reto-barra' ||
    exercise.id === 'rosca-inversa-barra-reta' ||
    exercise.id === 'triceps-testa-inclinado-barra-w'
  )
    return bases[2];
  if (exercise.id === 'panturrilha-sentada-maquina') return bases[4];
  if (exercise.id === 'elevacao-frontal-anilha') return bases[5];
  return exercise.equipment.toLowerCase().includes('halter')
    ? bases[0]
    : bases[3];
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function numeric(
  value: unknown,
  label: string,
  min: number,
  max: number,
  optional = false,
): number | null {
  const text = inputText(value).trim().replace(',', '.');
  if (!text && optional) return null;
  const number = Number(text);
  if (!text || !Number.isFinite(number) || number < min || number > max)
    throw new Error(`${label}: informe um número entre ${min} e ${max}.`);
  return number;
}
export function parseMeasurement(values: Record<string, unknown>): Measurement {
  const month = inputText(values.month);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > localDate().slice(0, 7))
    throw new Error('Escolha um mês válido, não futuro.');
  const result: Record<string, unknown> = { id: month, month };
  for (const [key, label] of measureFields)
    result[key] = numeric(
      values[key],
      label,
      0.1,
      key === 'weight' ? 500 : 300,
      key !== 'weight' && key !== 'height',
    );
  return result as Measurement;
}
export function parseLoad(
  values: Record<string, unknown>,
  exercise: Exercise,
  id: string,
): LoadEntry {
  const date = inputText(values.date);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T12:00:00`)) ||
    new Date(`${date}T12:00:00`).toISOString().slice(0, 10) !== date ||
    date > localDate()
  )
    throw new Error('Informe uma data válida, não futura.');
  const basis = inputText(values.basis);
  if (!(bases as readonly string[]).includes(basis))
    throw new Error('Escolha como a carga foi medida.');
  const equipment = inputText(values.equipment).trim();
  if (!equipment || equipment.length > 80)
    throw new Error('Identifique o equipamento em até 80 caracteres.');
  const sets = numeric(values.sets, 'Séries', 1, 100)!;
  const reps = numeric(values.reps, 'Repetições', 1, 1000)!;
  if (!Number.isInteger(sets) || !Number.isInteger(reps))
    throw new Error('Séries e repetições devem ser números inteiros.');
  return {
    id,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    equipment,
    basis,
    date,
    weight: numeric(values.weight, 'Carga', 0, 2000)!,
    sets,
    reps,
  };
}
export function compare(
  current: number | null | undefined,
  previous: number | null | undefined,
) {
  if (current == null || previous == null) return null;
  return {
    delta: Math.round((current - previous) * 100) / 100,
    percent:
      previous === 0
        ? null
        : Math.round(((current - previous) / previous) * 1000) / 10,
  };
}
export function comparableLoads(
  entries: LoadEntry[],
  target: Pick<LoadEntry, 'exerciseId' | 'equipment' | 'basis'>,
) {
  return entries
    .filter(
      (e) =>
        e.exerciseId === target.exerciseId &&
        e.equipment.trim().toLocaleLowerCase() ===
          target.equipment.trim().toLocaleLowerCase() &&
        e.basis === target.basis,
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
