'use client';

import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { firebaseConfig } from '@/firebase/config';
import { useMemo, type ReactNode } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => initializeFirebase(firebaseConfig), []);
  return <FirebaseProvider value={value}>{children}</FirebaseProvider>;
}
