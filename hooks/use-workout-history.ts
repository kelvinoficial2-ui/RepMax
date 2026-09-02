'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isFirebaseConfigured,
  saveWorkoutSession,
  subscribeWorkoutSessions,
  type WorkoutSession,
} from '@/lib/firebase';

export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [status, setStatus] = useState<
    'demo' | 'connecting' | 'synced' | 'saving' | 'error'
  >(isFirebaseConfigured ? 'connecting' : 'demo');

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubscribe: (() => void) | undefined;
    subscribeWorkoutSessions(
      (items) => {
        setSessions(items);
        setStatus('synced');
      },
      () => setStatus('error'),
    )
      .then((stop) => {
        unsubscribe = stop;
      })
      .catch(() => setStatus('error'));
    return () => unsubscribe?.();
  }, []);

  const save = useCallback(async (session: WorkoutSession) => {
    if (!isFirebaseConfigured) return false;
    setStatus('saving');
    try {
      await saveWorkoutSession(session);
      setStatus('synced');
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }, []);

  const summary = useMemo(
    () => ({
      workouts: sessions.length || 12,
      minutes:
        sessions.reduce((total, item) => total + item.durationMinutes, 0) ||
        540,
    }),
    [sessions],
  );

  return { sessions, status, summary, save };
}
