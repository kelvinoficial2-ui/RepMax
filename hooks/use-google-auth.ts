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
  const [signingIn, setSigningIn] = useState(false);

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
        if (nextUser) setError('');
        setLoading(false);
      }, (error) => {
        window.clearTimeout(timeout);
        setLoading(false);
        setError(`Não foi possível recuperar sua sessão. ${error.message}`);
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
    setSigningIn(true);
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
    } catch (error) {
      const code = (error as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/popup-blocked': 'A janela do Google foi bloqueada. Permita pop-ups para este site e toque em Entrar novamente.',
        'auth/popup-closed-by-user': 'A janela de login foi fechada. Toque em Entrar para tentar novamente.',
        'auth/cancelled-popup-request': 'O login foi interrompido. Tente novamente com apenas uma janela de login aberta.',
        'auth/network-request-failed': 'Não foi possível conectar ao Google. Verifique sua conexão.',
        'auth/web-storage-unsupported': 'O navegador está bloqueando o armazenamento necessário para entrar. Abra fora da navegação privada.',
        'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase. Abra repmax-c5c87.firebaseapp.com.',
      };
      setError(messages[code || ''] || `Não foi possível entrar com o Google. Tente novamente.${code ? ` (${code})` : ''}`);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutGoogle();
  }, []);

  return {
    user,
    loading,
    signingIn,
    error,
    login,
    logout,
    configured: isFirebaseConfigured,
  };
}
