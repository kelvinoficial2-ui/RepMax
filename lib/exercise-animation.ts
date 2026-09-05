type ExerciseAnimation = {
  src: string;
  cellSize: number;
  columns: number;
  upwardPoses: number[];
  movingWeight?: {
    x: number;
    y: number;
    width: number;
    height: number;
    maxLift: number;
  };
};

const animations: Record<string, ExerciseAnimation> = {
  'supino-reto-halteres': {
    src: '/exercises/supino-reto-halteres-v1.jpg',
    cellSize: 362,
    columns: 4,
    upwardPoses: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  'rosca-concentrada-halteres': {
    src: '/exercises/rosca-concentrada-halteres-v1.jpg',
    cellSize: 418,
    columns: 4,
    upwardPoses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  'abdominal-polia-alta-em-pe': {
    src: '/exercises/abdominal-polia-alta-em-pe-v2.jpg',
    cellSize: 362,
    columns: 4,
    upwardPoses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    // Coordinates of the selected top plates inside each 362 px frame.
    movingWeight: { x: 233, y: 254, width: 58, height: 23, maxLift: 42 },
  },
  'crucifixo-polia-alta': {
    src: '/exercises/crucifixo-polia-alta-v2.jpg',
    cellSize: 362,
    columns: 4,
    upwardPoses: [0, 1, 2, 3, 4],
  },
};

export const EXERCISE_FRAME_MS = 125;
export function exerciseAnimation(exerciseId: string) {
  const animation = animations[exerciseId];
  if (!animation) return null;
  const first = animation.upwardPoses[0];
  const end = animation.upwardPoses.at(-1)!;
  return {
    ...animation,
    sequence: [
      first,
      first,
      ...animation.upwardPoses,
      end,
      end,
      ...animation.upwardPoses.slice(0, -1).reverse(),
    ],
  };
}

export function exerciseAnimationFrame(exerciseId: string, index: number) {
  const animation = exerciseAnimation(exerciseId);
  if (!animation) return null;
  const frame = animation.sequence[index % animation.sequence.length];
  return {
    frame,
    x: (frame % animation.columns) * animation.cellSize + 1,
    y: Math.floor(frame / animation.columns) * animation.cellSize + 1,
    size: animation.cellSize - 2,
    progress:
      animation.upwardPoses.indexOf(frame) /
      Math.max(1, animation.upwardPoses.length - 1),
  };
}
