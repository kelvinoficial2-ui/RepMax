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
  waist: number | null;
  chest: number | null;
  hip: number | null;
  arm: number | null;
  thigh: number | null;
  calf: number | null;
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
] as const;
export const measureFields = [
  ['weight', 'Peso', 'kg'],
  ['height', 'Altura', 'cm'],
  ['waist', 'Cintura', 'cm'],
  ['chest', 'Peito', 'cm'],
  ['hip', 'Quadril', 'cm'],
  ['arm', 'Braço', 'cm'],
  ['thigh', 'Coxa', 'cm'],
  ['calf', 'Panturrilha', 'cm'],
] as const;
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
    id: 'triceps-polia',
    name: 'Tríceps na polia',
    equipment: 'Polia',
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
    id: 'rosca-concentrada-halteres',
    name: 'Rosca concentrada com halter',
    equipment: 'Halter',
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
  if (exercise.id === 'crucifixo-polia-alta') return bases[1];
  if (exercise.id === 'supino-reto-barra') return bases[2];
  if (exercise.id === 'panturrilha-sentada-maquina') return bases[4];
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
