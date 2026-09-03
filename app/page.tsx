'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  CloudOff,
  Dumbbell,
  Flame,
  Home,
  LogOut,
  Play,
  Plus,
  Sparkles,
  Target,
  TimerReset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { APP_RELEASE } from '@/lib/app-origin.mjs';

const exercises = [
  { name: 'Supino inclinado', detail: '4 séries · 10 repetições' },
  { name: 'Crucifixo com halteres', detail: '3 séries · 12 repetições' },
  { name: 'Tríceps na polia', detail: '3 séries · 12 repetições' },
  { name: 'Elevação lateral', detail: '3 séries · 15 repetições' },
];

const week = [
  { day: 'S', date: 31, trained: true },
  { day: 'T', date: 1, trained: true },
  { day: 'Q', date: 2, active: true },
  { day: 'Q', date: 3 },
  { day: 'S', date: 4 },
  { day: 'S', date: 5 },
  { day: 'D', date: 6 },
];

export default function HomePage() {
  const [completed, setCompleted] = useState(1);
  const [started, setStarted] = useState(false);
  const [saved, setSaved] = useState(false);
  const auth = useGoogleAuth();
  const { status, summary, save } = useWorkoutHistory(Boolean(auth.user));
  const progress = useMemo(
    () => (completed / exercises.length) * 100,
    [completed],
  );

  async function finishWorkout() {
    const success = await save({
      workoutName: 'Peito, tríceps e ombros',
      durationMinutes: 48,
      exercisesCompleted: exercises.length,
      totalExercises: exercises.length,
    });
    setSaved(success);
  }

  if (!auth.configured) return <FirebaseSetup />;
  if (auth.loading) return <LoadingScreen />;
  if (!auth.user)
    return <LoginScreen error={auth.error} onLogin={auth.login} busy={auth.signingIn} />;

  return (
    <main className="min-h-dvh bg-background pb-28 text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Boa noite,</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
              Vamos treinar?
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex ${status === 'synced' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
            >
              {status === 'synced' ? (
                <Cloud className="size-3.5" />
              ) : (
                <CloudOff className="size-3.5" />
              )}
              {status === 'synced'
                ? 'Firebase sincronizado'
                : status === 'saving'
                  ? 'Salvando…'
                  : status === 'error'
                    ? 'Erro ao sincronizar'
                    : 'Modo demonstração'}
            </span>
            <Button
              aria-label="Sair da conta Google"
              variant="ghost"
              size="icon-lg"
              className="rounded-full bg-card ring-1 ring-border"
              onClick={auth.logout}
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <section
          aria-label="Calendário da semana"
          className="mt-7 grid grid-cols-7 gap-2"
        >
          {week.map((item) => (
            <div
              key={`${item.day}-${item.date}`}
              className={`relative flex min-h-16 flex-col items-center justify-center rounded-2xl text-sm ${item.active ? 'bg-primary text-primary-foreground shadow-[0_8px_28px_rgb(31_211_196/18%)]' : 'bg-card text-muted-foreground ring-1 ring-border'}`}
            >
              <span className="text-[11px] font-semibold uppercase">
                {item.day}
              </span>
              <span className="mt-0.5 font-bold">{item.date}</span>
              {item.trained && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </section>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.55fr_0.8fr]">
          <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,#14272a_0%,#0d1719_68%)] text-white ring-1 ring-white/8">
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <CardContent className="relative grid gap-7 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <Sparkles className="size-4" /> Treino de hoje
                </div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Peito, tríceps
                  <br />e ombros
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                  4 exercícios · aproximadamente 48 minutos
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="h-12 rounded-2xl px-5 text-sm font-bold"
                    onClick={() => setStarted((value) => !value)}
                  >
                    {started ? (
                      <TimerReset />
                    ) : (
                      <Play className="fill-current" />
                    )}
                    {started ? 'Treino em andamento' : 'Começar treino'}
                  </Button>
                  <div className="flex h-12 items-center gap-2 rounded-2xl bg-white/7 px-4 text-sm text-white/70 ring-1 ring-white/10">
                    <Flame className="size-4 text-coral" /> Sequência de 4 dias
                  </div>
                </div>
              </div>
              <div className="flex size-32 items-center justify-center rounded-[2.2rem] bg-primary/12 ring-1 ring-primary/25 sm:size-40">
                <Dumbbell
                  className="size-16 text-primary sm:size-20"
                  strokeWidth={1.35}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card ring-1 ring-border">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meta semanal</p>
                  <p className="mt-1 text-3xl font-bold">
                    2{' '}
                    <span className="text-base font-medium text-muted-foreground">
                      de 4
                    </span>
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Target />
                </div>
              </div>
              <Progress
                value={50}
                className="mt-8 [&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-track]]:h-2"
              />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Mais dois treinos e você fecha sua semana.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Sua sessão
                </p>
                <h2 className="mt-1 text-xl font-bold">Exercícios de hoje</h2>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {completed}/{exercises.length}
              </span>
            </div>
            <Progress
              value={progress}
              className="mb-4 [&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-track]]:h-1.5"
            />
            <div className="space-y-3">
              {exercises.map((exercise, index) => {
                const done = index < completed;
                return (
                  <button
                    key={exercise.name}
                    className="group flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-primary/40"
                    onClick={() =>
                      setCompleted(
                        done
                          ? Math.max(0, index)
                          : Math.min(exercises.length, index + 1),
                      )
                    }
                  >
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {done ? <Check /> : <Dumbbell />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-semibold ${done ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {exercise.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {exercise.detail}
                      </span>
                    </span>
                    <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
            {completed === exercises.length && (
              <Button
                className="mt-4 h-12 w-full rounded-2xl font-bold"
                onClick={finishWorkout}
                disabled={status === 'saving' || saved}
              >
                <Check />
                {saved
                  ? 'Treino salvo no Firebase'
                  : status === 'demo'
                    ? 'Firebase precisa ser configurado'
                    : 'Concluir e salvar treino'}
              </Button>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Evolução
                </p>
                <h2 className="mt-1 text-xl font-bold">Últimos 30 dias</h2>
              </div>
              <BarChart3 className="text-muted-foreground" />
            </div>
            <Card className="border-0 bg-card ring-1 ring-border">
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Metric
                    icon={<Activity />}
                    value={String(summary.workouts)}
                    label="treinos"
                  />
                  <Metric
                    icon={<Clock3 />}
                    value={`${Math.round(summary.minutes / 60)}h`}
                    label="atividade"
                  />
                  <Metric icon={<Dumbbell />} value="+8%" label="carga" />
                </div>
                <div
                  className="mt-7 flex h-32 items-end gap-2 rounded-2xl bg-secondary/60 p-4"
                  aria-label="Gráfico de frequência de treino"
                >
                  {[38, 62, 46, 82, 58, 92, 70, 100].map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t-md bg-primary/25 last:bg-primary"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consistência</span>
                  <span className="font-bold text-primary">Muito boa</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-20 max-w-xl items-center justify-around border-t border-border bg-background/92 px-5 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:bottom-4 sm:rounded-3xl sm:border sm:shadow-2xl">
        <NavItem icon={<Home />} label="Início" active />
        <NavItem icon={<Dumbbell />} label="Treinos" />
        <button
          aria-label="Criar novo treino"
          className="-mt-8 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_36px_rgb(31_211_196/25%)] transition hover:scale-105"
        >
          <Plus />
        </button>
        <NavItem icon={<Activity />} label="Progresso" />
        <NavItem icon={<Target />} label="Metas" />
      </nav>
    </main>
  );
}

function LoginScreen({
  error,
  onLogin,
  busy,
}: {
  error: string;
  onLogin: () => void;
  busy: boolean;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm rounded-[2rem] bg-card p-7 text-center ring-1 ring-border sm:p-9">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-primary/10 text-primary ring-1 ring-primary/20">
          <Dumbbell className="size-10" strokeWidth={1.5} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Foco
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Seu treino continua aqui.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Entre para manter cargas, histórico e evolução sincronizados em todos
          os seus aparelhos.
        </p>
        <Button
          className="mt-7 h-12 w-full rounded-2xl bg-white font-bold text-[#17202a] hover:bg-white/90"
          onClick={onLogin}
          disabled={busy}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#4285f4] text-xs font-black text-white">
            G
          </span>
          {busy ? 'Aguardando o Google…' : 'Continuar com Google'}
        </Button>
        {error && (
          <p role="alert" className="mt-4 text-sm text-coral">
            {error}
          </p>
        )}
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Uso pessoal. Seus treinos ficam vinculados à conta escolhida.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Versão {APP_RELEASE}</p>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <Dumbbell className="mx-auto size-10 animate-pulse text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Preparando seus treinos…
        </p>
      </div>
    </main>
  );
}

function FirebaseSetup() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 text-foreground">
      <section className="max-w-md rounded-3xl bg-card p-7 text-center ring-1 ring-border">
        <CloudOff className="mx-auto size-9 text-coral" />
        <h1 className="mt-4 text-2xl font-bold">Firebase não configurado</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Adicione as variáveis do arquivo .env.example e reinicie o aplicativo.
        </p>
      </section>
    </main>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/60 px-2 py-4">
      <span className="mx-auto block w-fit text-primary [&_svg]:size-4">
        {icon}
      </span>
      <strong className="mt-2 block text-lg">{value}</strong>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-medium transition ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <span className="[&_svg]:size-5">{icon}</span>
      {label}
    </button>
  );
}
