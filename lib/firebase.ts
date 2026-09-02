import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  Object.values(firebaseConfig).every(Boolean);

function app(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado.');
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

async function currentUser(): Promise<User> {
  const auth = getAuth(app());
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (user) {
        stop();
        resolve(user);
        return;
      }
      try {
        const credential = await signInAnonymously(auth);
        stop();
        resolve(credential.user);
      } catch (error) {
        stop();
        reject(error);
      }
    });
  });
}

export async function saveWorkoutSession(session: WorkoutSession) {
  const user = await currentUser();
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
  const user = await currentUser();
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
