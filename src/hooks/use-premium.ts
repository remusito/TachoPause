'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAchievements } from './use-achievements';

const PREMIUM_STORAGE_KEY_V2 = 'premium-unlock-details-v2';

interface PremiumDetails {
  expiry: number | null; // null for permanent
  code: string;
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [unlockExpiry, setUnlockExpiry] = useState<number | null>(null);
  const { unlockAchievement } = useAchievements();

  const checkPremiumStatus = useCallback(() => {
    const storedDetails = localStorage.getItem(PREMIUM_STORAGE_KEY_V2);
    if (storedDetails) {
      try {
        const { expiry, code } = JSON.parse(storedDetails) as PremiumDetails;

        if (expiry === null) { // Permanent unlock
          setIsPremium(true);
          setUnlockExpiry(null);
          unlockAchievement('premium_supporter');
          return;
        }

        if (Date.now() < expiry) {
          setIsPremium(true);
          setUnlockExpiry(expiry);
          if (code.toLowerCase() === 'desmayaototal') {
             unlockAchievement('premium_supporter');
          }
        } else {
          setIsPremium(false);
          setUnlockExpiry(null);
          localStorage.removeItem(PREMIUM_STORAGE_KEY_V2);
        }
      } catch (e) {
        console.error("Failed to parse premium details", e);
        localStorage.removeItem(PREMIUM_STORAGE_KEY_V2);
        setIsPremium(false);
        setUnlockExpiry(null);
      }
    } else {
        setIsPremium(false);
        setUnlockExpiry(null);
    }
  }, [unlockAchievement]);

  useEffect(() => {
    checkPremiumStatus();
    const interval = setInterval(checkPremiumStatus, 60000); // every minute
    window.addEventListener('storage', checkPremiumStatus);
    
    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', checkPremiumStatus);
    };
  }, [checkPremiumStatus]);

  const unlockPremium = (code: 'DESMAYAO' | 'DESMAYAOTOTAL') => {
    let expiry: number | null = null;
    
    if (code === 'DESMAYAO') {
      const UNLOCK_DURATION = 2 * 60 * 60 * 1000; // 2 hours
      expiry = Date.now() + UNLOCK_DURATION;
    } else if (code === 'DESMAYAOTOTAL') {
      // "Permanent" unlock for 1 year
      const PERMANENT_UNLOCK_DURATION = 365 * 24 * 60 * 60 * 1000;
      expiry = Date.now() + PERMANENT_UNLOCK_DURATION;
      unlockAchievement('premium_supporter');
    }

    const premiumDetails: PremiumDetails = { expiry, code };
    localStorage.setItem(PREMIUM_STORAGE_KEY_V2, JSON.stringify(premiumDetails));
    checkPremiumStatus();
  };
  
  const purchasePremium = () => {
    const premiumDetails: PremiumDetails = { expiry: null, code: 'PAYPAL' };
    localStorage.setItem(PREMIUM_STORAGE_KEY_V2, JSON.stringify(premiumDetails));
    checkPremiumStatus();
    unlockAchievement('premium_supporter');
  }

  return { isPremium, unlockPremium, unlockExpiry, purchasePremium };
}
