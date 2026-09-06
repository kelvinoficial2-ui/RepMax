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
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/SUPINO_BARRA.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'supino-inclinado': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/SUPINO_INCLINADO_COM_ALTERES.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'supino-inclinado-maquina-articulada': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788663569/avatares/Lever_Incline_Chest_Press_Overview___Form_Tips_Benefits_1.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'triceps-testa-inclinado-barra-w': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788661228/avatares/How_To_Perform_The_Incline_EZ-Bar_Triceps_Extension.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'rosca-concentrada-halteres': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659171/avatares/ROSCA_CONCENTRADA_COM_HALTERES.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'rosca-inversa-barra-reta': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788661143/avatares/10_Best_Brachialis_Exercises_To_Build_Bigger_and_Stronger_Arms.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'rosca-martelo-polia-baixa-corda': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788662624/avatares/Top_5_Must-Try_Cable_Biceps_Exercises_For_Size_And_Definition_2.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'cadeira-extensora': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/CADEIRA_EXTENSORA.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'encolhimento-halteres': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/ENCOLHIMENTO_COM_ALTERES.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'barra-fixa-assistida-maquina': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660932/avatares/download_5.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'remada-alta-halteres': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/REMADA_ALTA_COM_HALTERES.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'face-pull-polia-corda': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660934/avatares/download_4.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'elevacao-frontal-anilha': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788663163/avatares/How_To_Do_Weight_Plate_Front_Raise_-_Benefits_Muscles_Worked.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'elevacao-lateral': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660649/avatares/download_2.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'elevacao-lateral-sentada': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788660703/avatares/download_3.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'abdominal-polia-alta-em-pe': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658720/avatares/ABDOMINAL_NA_POLIA.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'abdominal-halter-bracos-estendidos': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658752/avatares/42481301-Dumbbell-Straight-Arm-Crunch_Waist_720_1.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'panturrilha-sentada-maquina': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788658719/avatares/PANTURRILHA.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'avanco-frente-halteres': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788662664/avatares/download_7.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'crucifixo-polia-alta': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788659235/avatares/CRUCIFIXO_NA_POLIA.gif',
    animatedGif: true,
    cellSize: 1,
    columns: 1,
    upwardPoses: [0],
  },
  'crucifixo-maquina-peck-deck': {
    src: 'https://res.cloudinary.com/doo0fzoef/image/upload/v1788663356/avatares/How_To_Machine_Chest_Fly_To_Build_Bigger_Pecs.gif',
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
