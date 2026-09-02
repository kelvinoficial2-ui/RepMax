import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';

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

export function observeUser(receive: (user: User | null) => void) {
  const auth = getAuth(app());
  return onAuthStateChanged(auth, receive, () => receive(null));
}

export async function signInWithGoogle() {
  const auth = getAuth(app());
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  const isInstalledApp =
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true;
  if (isInstalledApp) {
    await signInWithRedirect(auth, provider);
    return;
  }
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
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
