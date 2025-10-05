'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAchievements as useAchievementsHook } from './use-achievements';

// The hook returns a lot of functions, but the context only needs to expose the state.
// Components will use the hook directly to call functions that modify state.
type AchievementsContextType = ReturnType<typeof useAchievementsHook>;

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
  const achievements = useAchievementsHook();

  return (
    <AchievementsContext.Provider value={achievements}>
      {children}
    </AchievementsContext.Provider>
  );
};

// This is the hook that components will use to access achievements state
export const useAchievements = (): AchievementsContextType => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};

    
