
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  Firestore,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useDocument<T>(
  path: string | null
): { data: T | null; loading: boolean; error: FirestoreError | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const db = useFirestore();

  const docRef = useMemo(() => {
    if (!db || !path) return null;
    try {
      return doc(db, path);
    } catch (e) {
      console.error("Failed to create document reference:", e);
      return null;
    }
  }, [db, path]);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      setData(null); // Clear data if path is invalid
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error in useDocument:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
