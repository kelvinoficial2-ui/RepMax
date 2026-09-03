import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  doc,
  setDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Measurement, LoadEntry, Exercise } from './tracking';

type TrackingCollections = {
  bodyMeasurements: Measurement;
  loadEntries: LoadEntry;
  exercises: Exercise;
};
export function subscribeTracking<K extends keyof TrackingCollections>(
  name: K,
  receive: (items: TrackingCollections[K][]) => void,
  fail: (error: Error) => void,
) {
  const uid = currentUser().uid;
  return onSnapshot(
    collection(getFirestore(app()), 'users', uid, name),
    (snapshot) => {
      receive(
        snapshot.docs.map(
          (item) => ({ ...item.data(), id: item.id }) as TrackingCollections[K],
        ),
      );
    },
    fail,
  );
}
export async function saveTracking<K extends keyof TrackingCollections>(
  name: K,
  value: TrackingCollections[K],
) {
  const uid = currentUser().uid;
  // Stable IDs make retries overwrite the same record, rather than duplicate it.
  await setDoc(doc(getFirestore(app()), 'users', uid, name, value.id), {
    ...value,
    updatedAt: serverTimestamp(),
  });
}

export type WorkoutSession = {
  id?: string;
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalExercises: number;
  completedAt?: Date;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  Object.values(firebaseConfig).every(Boolean);

function app(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado.');
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function observeUser(
  receive: (user: User | null) => void,
  fail: (error: Error) => void,
) {
  const auth = getAuth(app());
  return onAuthStateChanged(auth, receive, fail);
}

export async function signInWithGoogle() {
  const auth = getAuth(app());
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Keep popup creation inside the click gesture. getAuth defaults to local
  // persistence; awaiting setPersistence here can lose popup permission on iOS.
  // Do not fall back to redirect, which can lose state in partitioned storage.
  return signInWithPopup(auth, provider);
}

export async function signOutGoogle() {
  await signOut(getAuth(app()));
}

function currentUser(): User {
  const user = getAuth(app()).currentUser;
  if (!user) throw new Error('Entre com sua conta Google.');
  return user;
}

export async function saveWorkoutSession(session: WorkoutSession) {
  const user = currentUser();
  const db = getFirestore(app());
  await addDoc(collection(db, 'users', user.uid, 'workoutSessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });
}

export async function subscribeWorkoutSessions(
  receive: (sessions: WorkoutSession[]) => void,
  fail: (error: Error) => void,
): Promise<Unsubscribe> {
  const user = currentUser();
  const db = getFirestore(app());
  const sessions = query(
    collection(db, 'users', user.uid, 'workoutSessions'),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  return onSnapshot(
    sessions,
    (snapshot) => {
      receive(
        snapshot.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            workoutName: data.workoutName,
            durationMinutes: data.durationMinutes,
            exercisesCompleted: data.exercisesCompleted,
            totalExercises: data.totalExercises,
            completedAt: data.createdAt?.toDate?.(),
          };
        }),
      );
    },
    (error) => fail(error),
  );
}
