'use client';

import { PauseTracker } from '@/app/components/pause-tracker';
import { Icons } from '@/components/icons';
import { SettingsSheet } from '@/app/components/settings-sheet';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { usePremium } from '@/hooks/use-premium';
import { MainSidebar } from './components/main-sidebar';
import { useEffect } from 'react';
import { useAchievements } from '@/hooks/use-achievements-provider';

export default function Home() {
  const { isPremium } = usePremium();
  const { trackAppUsage } = useAchievements();

  useEffect(() => {
    trackAppUsage();
  }, [trackAppUsage]);


  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground relative">
          <header className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Icons.Menu />
              </SidebarTrigger>
              <Icons.Truck className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                TachoPause {isPremium ? <span className='text-primary'>Premium</span> : <span>Optimizer</span>}
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className="flex flex-1 items-center justify-center w-full px-4">
            <PauseTracker />
          </main>
          <footer className="absolute bottom-0 w-full text-center p-4">
            <p className="text-xs text-muted-foreground">
              Hecho con ❤️ para los héroes de la carretera.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
