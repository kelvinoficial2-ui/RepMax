// Same sprite and pose order as the approved preview. No generated replacements.
export const SUPINO_SPRITE = '/exercises/supino-reto-halteres-v1.jpg';
// These frames progress monotonically from the chest to full extension.
// Frames 8–10 repeat earlier heights and caused a visible backward jump.
export const SUPINO_UPWARD_POSES = [0, 1, 2, 3, 4, 5, 6, 7, 11];
export const SUPINO_SEQUENCE = [
  0,
  0,
  ...SUPINO_UPWARD_POSES,
  11,
  11,
  ...SUPINO_UPWARD_POSES.slice(0, -1).reverse(),
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
