'use client';

import { useState, useEffect, useCallback } from 'react';
import { allAchievements, type AchievementId } from '@/lib/achievements';

const ACHIEVEMENTS_STORAGE_KEY = 'achievements-storage';

type AchievementState = {
  [K in AchievementId]?: {
    unlocked: boolean;
    progress: number;
    unlockedAt?: number;
  };
};

// Helper to get today's date as a string (e.g., "2024-07-30")
const getTodayString = () => new Date().toISOString().split('T')[0];

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementState>({});

  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (storedData) {
        setAchievements(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load achievements from storage:', error);
    }
  }, []);

  // Persist achievements to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save achievements to storage:', error);
    }
  }, [achievements]);

  const unlockAchievement = useCallback((id: AchievementId) => {
    const achievementDef = allAchievements.find(a => a.id === id);
    if (!achievementDef) return;

    // Check if already unlocked
    if (achievements[id]?.unlocked) {
      return;
    }
    
    setAchievements(prev => ({
      ...prev,
      [id]: { ...prev[id], unlocked: true, progress: achievementDef.goal, unlockedAt: Date.now() },
    }));

  }, [achievements]);

  const updateAchievementProgress = useCallback((id: AchievementId, value: number) => {
    const achievementDef = allAchievements.find(a => a.id === id);
    if (!achievementDef || achievements[id]?.unlocked) {
        return;
    }

    const currentProgress = achievements[id]?.progress || 0;
    const newProgress = Math.max(currentProgress, value); // For max value goals (like speed)
    
    setAchievements(prev => ({
      ...prev,
      [id]: { ...prev[id], progress: Math.min(newProgress, achievementDef.goal) },
    }));

    if (newProgress >= achievementDef.goal) {
        unlockAchievement(id);
    }
  }, [achievements, unlockAchievement]);
  
  const incrementAchievementProgress = useCallback((id: AchievementId, amount: number = 1) => {
    const achievementDef = allAchievements.find(a => a.id === id);
    if (!achievementDef || achievements[id]?.unlocked) {
        return;
    }

    const currentProgress = achievements[id]?.progress || 0;
    const newProgress = currentProgress + amount;

    setAchievements(prev => ({
        ...prev,
        [id]: { ...prev[id], progress: Math.min(newProgress, achievementDef.goal) },
    }));

    if (newProgress >= achievementDef.goal) {
        unlockAchievement(id);
    }
  }, [achievements, unlockAchievement]);


  const trackAppUsage = useCallback(() => {
    unlockAchievement('first_use');

    // Logic for 'Constancia' achievement
    const today = getTodayString();
    const lastVisit = localStorage.getItem('last-visit-date');
    const consecutiveDays = parseInt(localStorage.getItem('consecutive-days') || '0', 10);
    
    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastVisit === yesterdayString) {
            const newConsecutiveDays = consecutiveDays + 1;
            localStorage.setItem('consecutive-days', String(newConsecutiveDays));
            updateAchievementProgress('consistency_5_days', newConsecutiveDays);
        } else {
            // Reset if the last visit wasn't yesterday
            localStorage.setItem('consecutive-days', '1');
            updateAchievementProgress('consistency_5_days', 1);
        }
        localStorage.setItem('last-visit-date', today);
    }
  }, [unlockAchievement, updateAchievementProgress]);


  const trackCycleStart = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 6) {
        unlockAchievement('early_bird');
    }
    if (hour >= 22) {
        unlockAchievement('night_owl');
    }

    // Logic for 'Maestro del Tiempo'
    const today = getTodayString();
    const cycleCountKey = `cycle-count-${today}`;
    const todayCycles = parseInt(localStorage.getItem(cycleCountKey) || '0', 10) + 1;
    localStorage.setItem(cycleCountKey, String(todayCycles));
    incrementAchievementProgress('time_master', 1);

  }, [unlockAchievement, incrementAchievementProgress]);


  return {
    achievements,
    unlockAchievement,
    updateAchievementProgress,
    incrementAchievementProgress,
    trackAppUsage,
    trackCycleStart,
  };
}
