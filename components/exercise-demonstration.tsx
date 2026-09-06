import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  EXERCISE_FRAME_MS,
  exerciseAnimation,
  exerciseAnimationFrame,
} from '@/lib/exercise-animation';

export function ExerciseDemonstration({ exerciseId }: { exerciseId: string }) {
  const animation = exerciseAnimation(exerciseId)!;
  if (animation.animatedGif) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl bg-white">
        {/* The original animated GIF must remain an img; canvas would drop its animation. */}
        {/* oxlint-disable-next-line next/no-img-element */}
        <img
          src={animation.src}
          alt="Demonstração animada do exercício selecionado."
          className="mx-auto block aspect-square w-full max-w-lg object-contain"
        />
        <div className="bg-[#061316] p-4 text-right">
          <p className="text-xs text-[#bed3d4]">Referência de movimento</p>
        </div>
      </div>
    );
  }
  return <SpriteExerciseDemonstration exerciseId={exerciseId} />;
}

function SpriteExerciseDemonstration({ exerciseId }: { exerciseId: string }) {
  const animation = useMemo(() => exerciseAnimation(exerciseId)!, [exerciseId]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const position = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const drawFrame = useCallback(
    function drawFrame(
      context: CanvasRenderingContext2D,
      sprite: HTMLImageElement,
      index: number,
    ) {
      const frame = exerciseAnimationFrame(exerciseId, index)!;
      context.clearRect(0, 0, 512, 512);
      context.drawImage(
        sprite,
        frame.x,
        frame.y,
        frame.size,
        frame.size,
        0,
        0,
        512,
        512,
      );
      const scale = 512 / frame.size;
      if (animation.movingWeight && frame.progress > 0) {
        const weight = animation.movingWeight;
        const lift = weight.maxLift * frame.progress;
        context.drawImage(
          sprite,
          frame.x + weight.x,
          frame.y + weight.y,
          weight.width,
          weight.height,
          weight.x * scale,
          (weight.y - lift) * scale,
          weight.width * scale,
          weight.height * scale,
        );
      }
    },
    [animation.movingWeight, exerciseId],
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {
      if (preference.matches) setPlaying(false);
    };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;
    const sprite = new Image();
    sprite.onload = () => {
      if (disposed) return;
      const context = canvas.current?.getContext('2d');
      if (!context) {
        setFailed(true);
        return;
      }
      image.current = sprite;
      position.current = 0;
      drawFrame(context, sprite, 0);
      setReady(true);
    };
    sprite.onerror = () => {
      if (!disposed) setFailed(true);
    };
    sprite.src = animation.src;
    return () => {
      disposed = true;
      sprite.onload = null;
      sprite.onerror = null;
      image.current = null;
    };
  }, [animation.src, attempt, drawFrame]);

  useEffect(() => {
    if (!ready || !playing || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !image.current) return;
      const context = canvas.current?.getContext('2d');
      if (!context) return;
      position.current = (position.current + 1) % animation.sequence.length;
      drawFrame(context, image.current, position.current);
    }, EXERCISE_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [animation.sequence.length, drawFrame, ready, playing, visible]);

  return (
    <div className="my-4 overflow-hidden rounded-2xl bg-[#061316]">
      <canvas
        ref={canvas}
        width={512}
        height={512}
        aria-label="Personagem RepMax demonstrando o exercício selecionado."
        className="mx-auto block aspect-square w-full max-w-lg"
      >
        Demonstração animada do exercício selecionado.
      </canvas>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        {failed ? (
          <>
            <p role="alert" className="text-sm text-white">
              A animação não carregou. Você pode registrar a carga normalmente.
            </p>
            <Button
              type="button"
              onClick={() => {
                setReady(false);
                setFailed(false);
                setAttempt((value) => value + 1);
              }}
            >
              Tentar novamente
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={!ready}
            className="min-h-11"
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <Pause /> : <Play />}
            {!ready
              ? 'Carregando animação…'
              : playing
                ? 'Pausar'
                : 'Reproduzir'}
          </Button>
        )}
        <p className="text-xs text-[#bed3d4]">
          Referência de movimento · RepMax
        </p>
      </div>
    </div>
  );
}
