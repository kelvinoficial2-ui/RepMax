// Same sprite and pose order as the approved preview. No generated replacements.
export const SUPINO_SPRITE = '/exercises/supino-reto-halteres-v1.jpg';
const poses = [0, 1, 2, 3, 4, 5, 8, 6, 9, 10, 7, 11];
export const SUPINO_SEQUENCE = [
  0,
  0,
  ...poses,
  11,
  11,
  ...poses.slice(0, -1).reverse(),
];
export const SUPINO_FRAME_MS = 125;
export function supinoFrame(index: number) {
  const frame = SUPINO_SEQUENCE[index % SUPINO_SEQUENCE.length];
  return {
    x: (frame % 4) * 362 + 1,
    y: Math.floor(frame / 4) * 362 + 1,
    size: 360,
  };
}
