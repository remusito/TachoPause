'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SettingsSheet } from '../components/settings-sheet';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { MainSidebar } from '../components/main-sidebar';
import React, { useMemo } from 'react';
import { useAchievements } from '@/hooks/use-achievements-provider';
import { allAchievements, type Achievement } from '@/lib/achievements';


export default function RewardsPage() {
  const { achievements: achievementState } = useAchievements();

  const processedAchievements = useMemo(() => {
    return allAchievements.map(achDef => {
      const state = achievementState[achDef.id];
      const isUnlocked = state?.unlocked || false;
      const progress = state?.progress || 0;
      const progressPercent = achDef.goal > 0 ? (progress / achDef.goal) * 100 : 0;
      
      return {
        ...achDef,
        unlocked: isUnlocked,
        progress: progressPercent,
      };
    });
  }, [achievementState]);
  
  const unlockedCount = processedAchievements.filter(a => a.unlocked).length;
  const totalCount = processedAchievements.length;
  
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex flex-col items-center min-h-dvh bg-background text-foreground relative p-4 sm:p-6">
          <header className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Icons.Menu />
              </SidebarTrigger>
              <Icons.Award className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Recompensas
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className="w-full max-w-4xl mx-auto flex-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Progreso de Logros</CardTitle>
                <CardDescription>
                  Has desbloqueado {unlockedCount} de {totalCount} logros. ¡Sigue así!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(unlockedCount / totalCount) * 100} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {processedAchievements.map((achievement, index) => (
                <Card
                  key={index}
                  className={cn(
                    'transition-all',
                    achievement.unlocked ? 'border-primary shadow-lg' : 'bg-muted/50'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <achievement.icon
                        className={cn(
                          'h-10 w-10 shrink-0',
                          achievement.unlocked
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <CardDescription className="text-xs">{achievement.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {!achievement.unlocked && (
                     <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Progress value={achievement.progress} className="h-2"/>
                            <span>{Math.round(achievement.progress)}%</span>
                        </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
