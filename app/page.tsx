'use client';

import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { PersonalDashboard } from '@/components/personal-dashboard';
import { APP_RELEASE } from '@/lib/app-origin.mjs';

export default function HomePage() {
  const auth = useGoogleAuth();
  if (!auth.configured)
    return <main className="p-8 text-center">Firebase não configurado.</main>;
  if (auth.loading)
    return (
      <main
        className="flex min-h-dvh items-center justify-center text-primary"
        aria-live="polite"
      >
        <Dumbbell className="mr-3 animate-pulse" /> Recuperando sua sessão…
      </main>
    );
  if (auth.user)
    return (
      <PersonalDashboard
        key={auth.user.uid}
        uid={auth.user.uid}
        onLogout={auth.logout}
      />
    );
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm rounded-[2rem] bg-card p-7 text-center ring-1 ring-border sm:p-9">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-primary/10 text-primary ring-1 ring-primary/20">
          <Dumbbell className="size-10" strokeWidth={1.5} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          RepMax
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Seu treino continua aqui.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Entre para manter cargas, medidas e evolução sincronizadas em todos os
          seus aparelhos.
        </p>
        <Button
          className="mt-7 h-12 w-full rounded-2xl bg-white font-bold text-[#17202a] hover:bg-white/90"
          onClick={auth.login}
          disabled={auth.signingIn}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#4285f4] text-xs font-black text-white">
            G
          </span>
          {auth.signingIn ? 'Aguardando o Google…' : 'Continuar com Google'}
        </Button>
        {auth.error && (
          <p role="alert" className="mt-4 text-sm text-coral">
            {auth.error}
          </p>
        )}
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Uso pessoal. Seus registros ficam vinculados à conta escolhida.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Versão {APP_RELEASE}
        </p>
      </section>
    </main>
  );
}
