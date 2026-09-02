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
    const timeout = window.setTimeout(() => {
      setError('A conexão demorou mais que o esperado. Entre novamente.');
      setLoading(false);
    }, 8000);
    try {
      const stop = observeUser((nextUser) => {
        window.clearTimeout(timeout);
        setUser(nextUser);
        setLoading(false);
      });
      return () => {
        window.clearTimeout(timeout);
        stop();
      };
    } catch {
      window.clearTimeout(timeout);
      window.setTimeout(() => {
        setError('Não foi possível iniciar o login. Verifique o Firebase.');
        setLoading(false);
      }, 0);
    }
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
