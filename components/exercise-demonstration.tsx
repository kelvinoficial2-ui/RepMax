import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SUPINO_SPRITE,
  SUPINO_SEQUENCE,
  SUPINO_FRAME_MS,
  supinoFrame,
} from '@/lib/exercise-animation';

export function ExerciseDemonstration() {
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
      const frame = supinoFrame(0);
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
      setReady(true);
    };
    sprite.onerror = () => {
      if (!disposed) setFailed(true);
    };
    sprite.src = SUPINO_SPRITE;
    return () => {
      disposed = true;
      sprite.onload = null;
      sprite.onerror = null;
      image.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (!ready || !playing || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !image.current) return;
      const context = canvas.current?.getContext('2d');
      if (!context) return;
      position.current = (position.current + 1) % SUPINO_SEQUENCE.length;
      const frame = supinoFrame(position.current);
      context.drawImage(
        image.current,
        frame.x,
        frame.y,
        frame.size,
        frame.size,
        0,
        0,
        512,
        512,
      );
    }, SUPINO_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [ready, playing, visible]);

  return (
    <div className="my-4 overflow-hidden rounded-2xl bg-[#061316]">
      <canvas
        ref={canvas}
        width={512}
        height={512}
        aria-label="Personagem RepMax demonstrando supino reto com halteres, elevando e abaixando os pesos."
        className="mx-auto block aspect-square w-full max-w-lg"
      >
        Demonstração animada de supino reto com halteres.
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
