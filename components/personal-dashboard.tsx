import { useState, type SyntheticEvent, type ReactNode } from 'react';
import { Activity, Dumbbell, LogOut, Ruler, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseDemonstration } from '@/components/exercise-demonstration';
import { useTracking } from '@/hooks/use-tracking';
import { useWorkoutHistory } from '@/hooks/use-workout-history';
import { saveTracking } from '@/lib/firebase';
import { APP_RELEASE } from '@/lib/app-origin.mjs';
import {
  bases,
  exerciseCategories,
  inputText,
  measureFields,
  measurementValue,
  localDate,
  parseMeasurement,
  parseLoad,
  compare,
  comparableLoads,
  defaultLoadBasis,
  type Measurement,
  type LoadEntry,
  type Exercise,
  type ExerciseCategory,
} from '@/lib/tracking';
import { exerciseAnimation } from '@/lib/exercise-animation';

const number = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const monthLabel = (value: string) =>
  new Date(`${value}-02T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
const newId = () => `${Date.now()}-${crypto.randomUUID()}`;
const values = (event: SyntheticEvent<HTMLFormElement>) =>
  Object.fromEntries(new FormData(event.currentTarget));

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 ring-1 ring-border sm:p-7">
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
function Feedback({ error, message }: { error: string; message: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="my-3 text-sm text-coral">
          {error}
        </p>
      )}
      {message && (
        <p aria-live="polite" className="my-3 text-sm text-primary">
          {message}
        </p>
      )}
    </>
  );
}
function Delta({
  current,
  previous,
  unit,
}: {
  current: number | null | undefined;
  previous: number | null | undefined;
  unit: string;
}) {
  const change = compare(current, previous);
  return (
    <span className="text-sm text-muted-foreground">
      {change
        ? `${change.delta > 0 ? '+' : ''}${number(change.delta)} ${unit}${change.percent == null ? '' : ` (${change.percent > 0 ? '+' : ''}${number(change.percent)}%)`}`
        : 'Sem comparação disponível'}
    </span>
  );
}

export function PersonalDashboard({
  uid,
  onLogout,
}: {
  uid: string;
  onLogout: () => Promise<void>;
}) {
  const data = useTracking(uid);
  const workouts = useWorkoutHistory();
  const [tab, setTab] = useState('treinos');
  const [logoutError, setLogoutError] = useState('');
  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1.75rem)] text-foreground">
      <header className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-bold text-primary">
            <Dumbbell /> RepMax
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            Seu progresso, de verdade.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargas e medidas vinculadas à sua conta.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Sair da conta"
          onClick={() => {
            void onLogout().catch(() =>
              setLogoutError('Não foi possível sair. Tente novamente.'),
            );
          }}
        >
          <LogOut />
        </Button>
      </header>
      <Feedback error={logoutError || data.error} message="" />
      {data.loading && !data.error ? (
        <p aria-live="polite">Carregando seus registros…</p>
      ) : data.error ? (
        <Button onClick={() => window.location.reload()}>
          Tentar carregar novamente
        </Button>
      ) : (
        <>
          <div hidden={tab !== 'treinos'}>
            <Training
              exercises={data.exercises}
              loads={data.loads}
              saveSession={workouts.save}
            />
          </div>
          <div hidden={tab !== 'medidas'}>
            <BodyMeasurements records={data.measurements} />
          </div>
          <div hidden={tab !== 'evolucao'}>
            <Evolution
              records={data.measurements}
              loads={data.loads}
              exercises={data.exercises}
            />
            <div className="mt-5">
              <Panel>
                <h2 className="text-xl font-bold">Sessões de treino</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Últimas 30 sessões salvas. Registros anteriores à atualização
                  são mantidos como foram gravados.
                </p>
                {workouts.status === 'error' ? (
                  <p role="alert" className="mt-3 text-coral">
                    Não foi possível carregar o histórico de sessões.
                  </p>
                ) : workouts.status === 'connecting' ? (
                  <p aria-live="polite">Carregando sessões…</p>
                ) : workouts.sessions.length === 0 ? (
                  <p className="mt-4">Nenhuma sessão finalizada ainda.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {workouts.sessions.map((session) => (
                      <li
                        key={session.id}
                        className="rounded-xl bg-secondary p-4"
                      >
                        <p>{session.workoutName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {session.completedAt?.toLocaleDateString('pt-BR') ||
                            'Confirmando data…'}{' '}
                          · {number(session.durationMinutes)} min ·{' '}
                          {session.exercisesCompleted} exercícios
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        RepMax · Versão {APP_RELEASE}
      </p>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-xl justify-around border-t border-border bg-background px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:rounded-3xl sm:border"
      >
        {(
          [
            ['treinos', 'Treinos', Dumbbell],
            ['medidas', 'Medidas', Ruler],
            ['evolucao', 'Evolução', Activity],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
            className={`flex min-h-12 flex-1 flex-col items-center gap-1 text-xs ${tab === id ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </main>
  );
}

const anatomyLabels = Object.fromEntries(
  measureFields.map(([key, label]) => [key, label]),
);

function AnatomyMap({ selected }: { selected: string }) {
  const active = (...regions: string[]) => regions.includes(selected);
  const zone = (isActive: boolean) =>
    isActive
      ? 'fill-primary stroke-primary [filter:drop-shadow(0_0_8px_rgb(38_215_198/.85))]'
      : 'fill-transparent stroke-transparent';
  return (
    <aside className="sticky top-4 rounded-2xl bg-[#071619] p-4 ring-1 ring-primary/20">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
          Mapa corporal
        </p>
        <p className="mt-1 min-h-10 text-sm font-semibold">
          {anatomyLabels[selected] || 'Selecione uma medida'}
        </p>
      </div>
      <svg
        viewBox="0 0 220 420"
        role="img"
        aria-label={`Região destacada: ${anatomyLabels[selected] || 'nenhuma'}`}
        className="mx-auto mt-2 h-auto w-full max-w-56"
      >
        <defs>
          <linearGradient id="bodyScan" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#254248" />
            <stop offset="1" stopColor="#10282d" />
          </linearGradient>
          <pattern
            id="scanLines"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 1h8" stroke="#26d7c6" strokeOpacity=".1" />
          </pattern>
        </defs>
        <g fill="url(#bodyScan)" stroke="#416269" strokeWidth="2">
          <circle cx="110" cy="35" r="25" />
          <rect x="99" y="58" width="22" height="25" rx="9" />
          <path d="M78 82Q110 68 142 82l12 79-18 73H84l-18-73z" />
          <path d="M75 88 48 101 30 191l19 5 28-72z" />
          <path d="m145 88 27 13 18 90-19 5-28-72z" />
          <path d="M87 230 70 301l5 105h24l11-104 1-72z" />
          <path d="m133 230 17 71-5 105h-24l-11-104-1-72z" />
        </g>
        <g fill="url(#scanLines)" opacity=".9">
          <circle cx="110" cy="35" r="23" />
          <path d="M80 84Q110 71 140 84l11 76-17 70H86l-17-70z" />
        </g>
        <g className="transition-all duration-300" strokeWidth="2">
          <rect
            className={zone(active('neck'))}
            x="97"
            y="57"
            width="26"
            height="28"
            rx="10"
          />
          <path
            className={zone(active('shoulders'))}
            d="M69 91Q110 66 151 91l-7 29q-34-20-68 0z"
          />
          <path
            className={zone(active('chestRelaxed', 'chestInspired'))}
            d="M80 112q30-17 60 0l5 39q-35 15-70 0z"
          />
          <rect
            className={zone(active('waist'))}
            x="82"
            y="155"
            width="56"
            height="24"
            rx="10"
          />
          <rect
            className={zone(active('abdomen'))}
            x="84"
            y="177"
            width="52"
            height="32"
            rx="12"
          />
          <path
            className={zone(active('hip'))}
            d="M84 207h52l6 27q-32 18-64 0z"
          />
          <path
            className={zone(active('armRight'))}
            d="m72 94-22 10-10 43 19 5 17-35z"
          />
          <path
            className={zone(active('forearmRight'))}
            d="m40 145-11 47 20 5 12-48z"
          />
          <path
            className={zone(active('armLeft'))}
            d="m148 94 22 10 10 43-19 5-17-35z"
          />
          <path
            className={zone(active('forearmLeft'))}
            d="m180 145 11 47-20 5-12-48z"
          />
          <path
            className={zone(active('thighRight'))}
            d="M86 232h25l-8 72-32-4z"
          />
          <path
            className={zone(active('thighLeft'))}
            d="M109 232h25l15 68-32 4z"
          />
          <path
            className={zone(active('calfRight'))}
            d="m71 300 32 3-5 101H76z"
          />
          <path
            className={zone(active('calfLeft'))}
            d="m117 303 32-3-5 104h-22z"
          />
          <circle
            className={zone(active('weight', 'height'))}
            cx="110"
            cy="205"
            r="91"
            strokeDasharray="7 8"
          />
        </g>
        <path
          d="M110 12v394"
          stroke="#26d7c6"
          strokeOpacity=".12"
          strokeDasharray="3 8"
        />
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Esquerdo e direito consideram o lado da pessoa ilustrada.
      </p>
    </aside>
  );
}

function BodyMeasurements({ records }: { records: Measurement[] }) {
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [selectedMeasure, setSelectedMeasure] = useState('waist');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const existing = records.find((item) => item.month === month);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const record = parseMeasurement({ ...values(event), month });
      setBusy(true);
      await saveTracking('bodyMeasurements', record);
      setMessage(`Avaliação de ${monthLabel(month)} salva no Firebase.`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <Panel>
        <h2 className="text-xl font-bold">Medidas do mês</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Uma avaliação por mês. Peso e altura são obrigatórios; preencha as
          outras medidas que deseja acompanhar. Toque em um campo para localizar
          a região no mapa corporal. Meça sempre no mesmo ponto.
        </p>
        <Field label="Mês da avaliação">
          <Input
            className="h-12"
            type="month"
            value={month}
            max={localDate().slice(0, 7)}
            disabled={busy}
            onChange={(event) => {
              setMonth(event.target.value);
              setMessage('');
              setError('');
            }}
          />
        </Field>
        <form
          key={`${month}-${existing?.id || 'new'}`}
          onSubmit={submit}
          className="mt-5"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <fieldset disabled={busy} className="space-y-4">
              {[...new Set(measureFields.map((field) => field[3]))].map(
                (group) => (
                  <section
                    key={group}
                    className="rounded-2xl bg-secondary/55 p-4 ring-1 ring-border"
                  >
                    <h3 className="mb-3 font-bold text-primary">{group}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {measureFields
                        .filter((field) => field[3] === group)
                        .map(([key, label, unit]) => (
                          <div
                            key={key}
                            className={
                              selectedMeasure === key
                                ? 'rounded-xl ring-2 ring-primary'
                                : 'rounded-xl'
                            }
                          >
                            <Field
                              label={`${label} (${unit})${key === 'weight' || key === 'height' ? ' *' : ''}`}
                            >
                              <Input
                                className="h-12"
                                name={key}
                                inputMode="decimal"
                                defaultValue={
                                  measurementValue(existing, key) ?? ''
                                }
                                required={key === 'weight' || key === 'height'}
                                placeholder={
                                  key === 'height' ? 'Ex.: 175' : '0,0'
                                }
                                onFocus={() => setSelectedMeasure(key)}
                                onClick={() => setSelectedMeasure(key)}
                              />
                            </Field>
                          </div>
                        ))}
                    </div>
                  </section>
                ),
              )}
            </fieldset>
            <AnatomyMap selected={selectedMeasure} />
          </div>
          {existing && (
            <p className="mt-4 text-sm text-muted-foreground">
              Já existe uma avaliação neste mês. Ao salvar, você atualiza este
              registro, sem criar uma duplicata.
            </p>
          )}
          <Feedback error={error} message={message} />
          <Button
            type="submit"
            disabled={busy || !month}
            className="mt-5 h-12 w-full"
          >
            {busy
              ? 'Salvando…'
              : existing
                ? 'Atualizar avaliação do mês'
                : 'Salvar avaliação mensal'}
          </Button>
        </form>
      </Panel>
      <Panel>
        <h2 className="mb-4 text-xl font-bold">Avaliações salvas</h2>
        {records.length === 0 ? (
          <p className="text-muted-foreground">
            Sua primeira avaliação será o ponto de partida.
          </p>
        ) : (
          <ul className="space-y-3">
            {[...records].reverse().map((item) => (
              <li key={item.id}>
                <button
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-secondary p-4 text-left"
                  onClick={() => {
                    setMonth(item.month);
                    setMessage('');
                    setError('');
                  }}
                >
                  <span className="capitalize">{monthLabel(item.month)}</span>
                  <span className="text-primary">
                    {number(item.weight)} kg · Editar
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Training({
  exercises,
  loads,
  saveSession,
}: {
  exercises: Exercise[];
  loads: LoadEntry[];
  saveSession: ReturnType<typeof useWorkoutHistory>['save'];
}) {
  const [started, setStarted] = useState<number | null>(null);
  const [startingIds, setStartingIds] = useState<Set<string>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  const [selected, setSelected] = useState(exercises[0]?.id || '');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [exerciseId, setExerciseId] = useState(newId);
  const [category, setCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const exercise =
    exercises.find((item) => item.id === selected) || exercises[0];
  async function finish() {
    if (!started) return;
    const entries = loads.filter(
      (entry) =>
        !startingIds.has(entry.id) &&
        entry.date >= localDate(new Date(started)),
    );
    const count = new Set(entries.map((entry) => entry.exerciseId)).size;
    if (!count) {
      setSessionMessage(
        'Registre pelo menos uma carga nesta sessão antes de finalizar.',
      );
      return;
    }
    setFinishing(true);
    const saved = await saveSession({
      workoutName: 'Treino pessoal',
      durationMinutes: Math.round((Date.now() - started) / 6000) / 10,
      exercisesCompleted: count,
      totalExercises: count,
    });
    setFinishing(false);
    if (saved) {
      setStarted(null);
      setSessionMessage('Sessão salva. Consulte a aba Evolução.');
    } else
      setSessionMessage('Não foi possível salvar a sessão. Tente novamente.');
  }
  async function add(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = values(event);
    setError('');
    const name = inputText(form.name).trim(),
      equipment = inputText(form.equipment).trim(),
      exerciseCategory = inputText(form.category) as ExerciseCategory;
    if (!name || name.length > 80 || !equipment || equipment.length > 80) {
      setError('Informe nome e equipamento, com até 80 caracteres cada.');
      return;
    }
    if (!exerciseCategories.includes(exerciseCategory)) {
      setError('Escolha uma categoria válida.');
      return;
    }
    setBusy(true);
    try {
      await saveTracking('exercises', {
        id: exerciseId,
        name,
        equipment,
        category: exerciseCategory,
      });
      setSelected(exerciseId);
      setCategory(exerciseCategory);
      setAdding(false);
      setExerciseId(newId());
    } catch {
      setError('Não foi possível salvar o exercício. Verifique sua conexão.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <Panel>
        <h2 className="text-xl font-bold">Sessão de hoje</h2>
        <p className="my-3 text-sm text-muted-foreground">
          {started
            ? 'Sessão iniciada. Registre abaixo suas cargas e finalize ao terminar. Mantenha esta página aberta até finalizar.'
            : 'Inicie uma sessão para registrar a duração e os exercícios realizados. Você também pode salvar cargas avulsas abaixo.'}
        </p>
        <Button
          className="h-12"
          disabled={finishing}
          onClick={() => {
            if (started) void finish();
            else {
              setStarted(Date.now());
              setStartingIds(new Set(loads.map((entry) => entry.id)));
              setSessionMessage('');
            }
          }}
        >
          {finishing
            ? 'Salvando…'
            : started
              ? 'Finalizar sessão'
              : 'Começar treino'}
        </Button>
        {sessionMessage && (
          <p aria-live="polite" className="mt-3 text-sm">
            {sessionMessage}
          </p>
        )}
      </Panel>
      <Panel>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Exercícios e cargas</h2>
          <Button
            variant="secondary"
            className="h-11"
            onClick={() => setAdding(!adding)}
          >
            <Plus />
            {adding ? 'Fechar' : 'Adicionar'}
          </Button>
        </div>
        <p className="my-4 text-sm text-muted-foreground">
          Registre a carga que usou, as séries e as repetições. Cada equipamento
          tem seu próprio histórico.
        </p>
        {adding && (
          <form
            onSubmit={add}
            className="mb-5 grid gap-3 rounded-2xl bg-secondary p-4"
          >
            <Field label="Nome do exercício">
              <Input
                className="h-12"
                name="name"
                required
                maxLength={80}
                placeholder="Ex.: Leg press"
              />
            </Field>
            <Field label="Equipamento">
              <Input
                className="h-12"
                name="equipment"
                required
                maxLength={80}
                placeholder="Ex.: Leg press 45° — máquina 1"
              />
            </Field>
            <Field label="Categoria">
              <select
                className="h-12 rounded-lg border border-input bg-secondary px-3 text-foreground"
                name="category"
                defaultValue="Outros"
              >
                {exerciseCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Feedback error={error} message="" />
            <Button type="submit" disabled={busy} className="h-12">
              {busy ? 'Salvando…' : 'Salvar exercício'}
            </Button>
          </form>
        )}
        <div
          className="mb-4 flex gap-2 overflow-x-auto pb-1"
          aria-label="Filtrar exercícios por categoria"
        >
          {(['Todos', ...exerciseCategories] as const).map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={category === item ? 'default' : 'secondary'}
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {exercises
            .filter(
              (item) =>
                category === 'Todos' ||
                (item.category || 'Outros') === category,
            )
            .map((item) => (
              <Button
                key={item.id}
                variant={item.id === exercise?.id ? 'default' : 'secondary'}
                className="h-auto min-h-12 justify-start whitespace-normal py-3 text-left"
                onClick={() => setSelected(item.id)}
              >
                <span>
                  <span className="block">{item.name}</span>
                  <span className="block text-xs opacity-70">
                    {item.category || 'Outros'}
                  </span>
                </span>
              </Button>
            ))}
        </div>
      </Panel>
      {exercise && (
        <LoadForm key={exercise.id} exercise={exercise} loads={loads} />
      )}
    </div>
  );
}

function LoadForm({
  exercise,
  loads,
}: {
  exercise: Exercise;
  loads: LoadEntry[];
}) {
  const history = loads.filter((item) => item.exerciseId === exercise.id);
  const latest = history.at(-1);
  const [id, setId] = useState(newId);
  const [editing, setEditing] = useState<LoadEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [equipment, setEquipment] = useState(
    latest?.equipment || exercise.equipment,
  );
  const [basis, setBasis] = useState(
    latest?.basis || defaultLoadBasis(exercise),
  );
  const matching = comparableLoads(loads, {
    exerciseId: exercise.id,
    equipment,
    basis,
  });
  const last = matching.at(-1),
    prior = matching.at(-2);
  function edit(entry: LoadEntry | null) {
    setEditing(entry);
    setId(entry?.id || newId());
    setEquipment(entry?.equipment || latest?.equipment || exercise.equipment);
    setBasis(entry?.basis || latest?.basis || defaultLoadBasis(exercise));
    setError('');
    setMessage('');
  }
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const entry = parseLoad(
        { ...values(event), equipment, basis },
        exercise,
        id,
      );
      setBusy(true);
      await saveTracking('loadEntries', entry);
      setMessage('Carga salva no Firebase. O histórico já foi atualizado.');
      setEditing(null);
      setId(newId());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Panel>
        <h2 className="text-xl font-bold">{exercise.name}</h2>
        {exerciseAnimation(exercise.id) ? (
          <ExerciseDemonstration exerciseId={exercise.id} />
        ) : (
          <details className="my-4 rounded-2xl bg-secondary p-4">
            <summary className="cursor-pointer text-sm text-primary">
              Demonstração do exercício
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              A demonstração deste exercício ainda não está disponível.
            </p>
          </details>
        )}
        <form key={id} onSubmit={submit} className="space-y-4">
          <h3 className="font-semibold">
            {editing ? 'Corrigir registro' : 'Registrar carga utilizada'}
          </h3>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <Field label="Data do treino">
              <Input
                className="h-12"
                name="date"
                type="date"
                required
                max={localDate()}
                defaultValue={editing?.date || localDate()}
              />
            </Field>
            <Field label="Equipamento / identificação">
              <Input
                className="h-12"
                name="equipment"
                value={equipment}
                maxLength={80}
                required
                onChange={(e) => setEquipment(e.target.value)}
              />
            </Field>
            <Field label="Como você conta a carga">
              <select
                className="h-12 min-w-0 rounded-lg border border-input bg-secondary px-3 text-foreground"
                name="basis"
                value={basis}
                onChange={(e) => setBasis(e.target.value)}
              >
                {bases.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label={`Carga (${basis})`}>
              <Input
                className="h-12"
                name="weight"
                inputMode="decimal"
                required
                defaultValue={editing?.weight ?? last?.weight ?? ''}
                placeholder="Ex.: 12,5"
              />
            </Field>
            <Field label="Séries realizadas">
              <Input
                className="h-12"
                name="sets"
                inputMode="numeric"
                required
                defaultValue={editing?.sets ?? last?.sets ?? 3}
              />
            </Field>
            <Field label="Repetições por série">
              <Input
                className="h-12"
                name="reps"
                inputMode="numeric"
                required
                defaultValue={editing?.reps ?? last?.reps ?? 10}
              />
            </Field>
          </fieldset>
          <p className="text-xs leading-5 text-muted-foreground">
            Ex.: dois halteres de 10 kg = 10 kg por halter. No crossover,
            informe a carga selecionada em cada lado. Na barra, informe o total
            incluindo a barra. Se as séries tiveram cargas ou repetições
            diferentes, salve registros separados. Não compare máquinas
            diferentes como se fossem iguais.
          </p>
          <Feedback error={error} message={message} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy} className="h-12 flex-1">
              {busy
                ? 'Salvando…'
                : editing
                  ? 'Atualizar carga'
                  : 'Salvar carga'}
            </Button>
            {editing && (
              <Button
                disabled={busy}
                variant="secondary"
                className="h-12"
                onClick={() => edit(null)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
        {last && (
          <div className="mt-5 rounded-2xl bg-secondary p-4">
            <p className="font-semibold">
              Última carga: {number(last.weight)} {basis}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateLabel(last.date)} · {last.sets} × {last.reps}
            </p>
            <p className="mt-2">
              <Delta current={last.weight} previous={prior?.weight} unit="kg" />{' '}
              <span className="text-xs text-muted-foreground">
                vs. registro anterior neste equipamento
              </span>
            </p>
          </div>
        )}
      </Panel>
      <Panel>
        <h3 className="mb-4 text-lg font-bold">Histórico de {exercise.name}</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma carga registrada ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {[...history].reverse().map((entry) => (
              <li key={entry.id} className="rounded-xl bg-secondary p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {number(entry.weight)} {entry.basis}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dateLabel(entry.date)} · {entry.equipment} · {entry.sets}{' '}
                      × {entry.reps}
                    </p>
                  </div>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    onClick={() => edit(entry)}
                  >
                    Editar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function Evolution({
  records,
  loads,
  exercises,
}: {
  records: Measurement[];
  loads: LoadEntry[];
  exercises: Exercise[];
}) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const current =
    records.find((item) => item.month === selectedMonth) || records.at(-1);
  const previous = current
    ? records.filter((item) => item.month < current.month).at(-1)
    : undefined;
  const first = records[0];
  return (
    <div className="space-y-5">
      <Panel>
        <h2 className="text-xl font-bold">Evolução corporal</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Diferenças calculadas apenas com suas avaliações salvas. Não são uma
          avaliação médica nem uma estimativa de gordura ou músculo.
        </p>
        {!current ? (
          <p>Registre sua primeira avaliação na aba Medidas.</p>
        ) : (
          <>
            <Field label="Avaliação para comparar">
              <select
                className="h-12 rounded-lg border border-input bg-secondary px-3 text-foreground"
                value={current.month}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {records.map((item) => (
                  <option key={item.id} value={item.month}>
                    {monthLabel(item.month)}
                  </option>
                ))}
              </select>
            </Field>
            <p className="my-4 text-sm text-muted-foreground">
              {previous
                ? `Comparação com a avaliação anterior: ${monthLabel(previous.month)}.`
                : 'Este é seu ponto de partida. A comparação aparece após a próxima avaliação.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {measureFields.map(([key, label, unit]) => (
                <div key={key} className="rounded-2xl bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="my-2 text-xl font-bold">
                    {measurementValue(current, key) == null
                      ? '—'
                      : `${number(measurementValue(current, key)!)} ${unit}`}
                  </p>
                  <Delta
                    current={measurementValue(current, key)}
                    previous={measurementValue(previous, key)}
                    unit={unit}
                  />
                  {first && first.month !== current.month && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Desde {monthLabel(first.month)}:{' '}
                      <Delta
                        current={measurementValue(current, key)}
                        previous={measurementValue(first, key)}
                        unit={unit}
                      />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
      <Panel>
        <h2 className="mb-4 text-xl font-bold">Evolução das cargas</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Primeiro e último registro de cada exercício, equipamento e forma de
          contar a carga. Considere também as séries e repetições ao comparar.
        </p>
        {loads.length === 0 ? (
          <p className="text-muted-foreground">
            Salve cargas na aba Treinos para começar seu histórico.
          </p>
        ) : (
          exercises.flatMap((exercise) => {
            const groups = new Map<string, LoadEntry>();
            loads
              .filter((entry) => entry.exerciseId === exercise.id)
              .forEach((entry) =>
                groups.set(
                  `${entry.equipment.trim().toLowerCase()}|${entry.basis}`,
                  entry,
                ),
              );
            return [...groups.values()].map((target) => {
              const entries = comparableLoads(loads, target);
              const start = entries[0],
                end = entries.at(-1)!;
              return (
                <div
                  key={`${exercise.id}-${target.equipment}-${target.basis}`}
                  className="mb-3 rounded-2xl bg-secondary p-4"
                >
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="my-1 text-sm text-muted-foreground">
                    {target.equipment} · {target.basis}
                  </p>
                  <p className="my-3 text-xl font-bold">
                    {number(start.weight)} → {number(end.weight)} kg
                  </p>
                  <Delta
                    current={end.weight}
                    previous={entries.length > 1 ? start.weight : undefined}
                    unit="kg"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {dateLabel(start.date)} ({start.sets} × {start.reps}) →{' '}
                    {dateLabel(end.date)} ({end.sets} × {end.reps}) ·{' '}
                    {entries.length} registros
                  </p>
                </div>
              );
            });
          })
        )}
      </Panel>
    </div>
  );
}
