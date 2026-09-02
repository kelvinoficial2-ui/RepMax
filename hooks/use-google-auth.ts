'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  isFirebaseConfigured,
  observeUser,
  signInWithGoogle,
  signOutGoogle,
} from '@/lib/firebase';

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return observeUser((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError('Não foi possível entrar com o Google. Tente novamente.');
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutGoogle();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    configured: isFirebaseConfigured,
  };
}
