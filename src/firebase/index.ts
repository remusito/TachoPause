import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';

export * from './provider';
export * from './auth/provider';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase(options: FirebaseOptions): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(options);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);

    if (process.env.NEXT_PUBLIC_EMULATORS_ENABLED === 'true') {
        const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
        const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
    
        if (!firestoreHost) {
          throw new Error('Missing NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST env var');
        }
    
        if (!authHost) {
          throw new Error('Missing NEXT_PUBLIC_AUTH_EMULATOR_HOST env var');
        }
    
        connectFirestoreEmulator(firestore, 'localhost', parseInt(firestoreHost.split(':')[1]));
        connectAuthEmulator(auth, `http://${authHost}`);
      }
  } else {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }


  return { app: firebaseApp, auth, firestore };
}
