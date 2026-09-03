import { useEffect, useState } from 'react';
import { subscribeTracking } from '@/lib/firebase';
import {
  initialExercises,
  type Measurement,
  type LoadEntry,
  type Exercise,
} from '@/lib/tracking';

export function useTracking(uid: string) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loads, setLoads] = useState<LoadEntry[]>([]);
  const [custom, setCustom] = useState<Exercise[]>([]);
  const [ready, setReady] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const received = (name: string) =>
      setReady((previous) => [...new Set([...previous, name])]);
    const fail = () =>
      setError(
        'Não foi possível carregar seus dados do Firebase. Confira a conexão e recarregue antes de editar.',
      );
    const stops = [
      subscribeTracking(
        'bodyMeasurements',
        (items) => {
          setMeasurements(items.sort((a, b) => a.month.localeCompare(b.month)));
          received('body');
        },
        fail,
      ),
      subscribeTracking(
        'loadEntries',
        (items) => {
          setLoads(
            items.sort(
              (a, b) =>
                a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
            ),
          );
          received('loads');
        },
        fail,
      ),
      subscribeTracking(
        'exercises',
        (items) => {
          setCustom(items);
          received('exercises');
        },
        fail,
      ),
    ];
    return () => stops.forEach((stop) => stop());
  }, [uid]);
  return {
    measurements,
    loads,
    exercises: [...initialExercises, ...custom],
    loading: ready.length < 3,
    error,
  };
}
