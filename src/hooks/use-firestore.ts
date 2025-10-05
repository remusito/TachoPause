
'use client';
import { useFirebase } from '@/firebase';

/**
 * A simple hook to get the Firestore instance.
 */
export function useFirestore() {
  return useFirebase().firestore;
}
