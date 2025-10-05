
'use client';

import { useAuth } from '@/firebase/auth/provider';

/**
 * A hook to easily access the user's premium status.
 * It gets the live premium state from the AuthProvider, which is connected to Firestore.
 */
export function usePremium() {
  const { isPremium } = useAuth();
  return { isPremium };
}
