type ExerciseAnimation = {
  src: string;
  animatedGif?: boolean;
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
  'supino-reto-barra': {
    src: '/exercises/supino-reto-barra.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'rosca-concentrada-halteres': {
    src: '/exercises/rosca-concentrada-halteres-v1.jpg',
    cellSize: 418,
    columns: 4,
    upwardPoses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  'abdominal-polia-alta-em-pe': {
    src: '/exercises/abdominal-polia-alta-em-pe.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'crucifixo-polia-alta': {
    src: '/exercises/crucifixo-polia-alta.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
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
