type ExerciseAnimation = {
  src: string;
  cellSize: number;
  columns: number;
  upwardPoses: number[];
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
    x: (frame % animation.columns) * animation.cellSize + 1,
    y: Math.floor(frame / animation.columns) * animation.cellSize + 1,
    size: animation.cellSize - 2,
  };
}
