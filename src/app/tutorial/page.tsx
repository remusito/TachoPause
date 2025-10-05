'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SettingsSheet } from '../components/settings-sheet';
import { MainSidebar } from '../components/main-sidebar';
import { useEffect } from 'react';
import { useAchievements } from '@/hooks/use-achievements-provider';

export default function TutorialPage() {
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    unlockAchievement('tutorial_guru');
  }, [unlockAchievement]);

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground p-4">
           <header className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Icons.Menu />
              </SidebarTrigger>
               <Icons.BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Tutorial
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className='flex flex-1 items-center justify-center w-full'>
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                  <Icons.BookOpen className="h-8 w-8" />
                  Tutorial de TachoPause
                </CardTitle>
                <CardDescription className="text-center">
                  Aprende a usar la aplicación para optimizar tus tiempos de conducción y descanso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Icons.Play className="text-primary"/>Iniciar el ciclo</h3>
                  <p className="text-muted-foreground">
                    Presiona el botón <strong>Iniciar</strong> en la pantalla principal. Esto activará el temporizador y comenzará el ciclo de conducción y pausas.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Fases del Semáforo:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong className="text-yellow-500">Amarillo (30s):</strong> Parpadea al inicio. Es una fase de preparación antes de que comience el tiempo de conducción.</li>
                      <li><strong className="text-green-500">Verde (50s):</strong> ¡A conducir! Este es tu período de conducción activa. Escucharás un sonido al comenzar esta fase.</li>
                      <li><strong className="text-yellow-500">Amarillo (10s):</strong> Parpadea de nuevo como advertencia de que tu tiempo de conducción está a punto de terminar. Sonará una alerta.</li>
                      <li><strong className="text-destructive">Rojo (60s):</strong> Pausa obligatoria. Es el momento de detener el vehículo y descansar.</li>
                    </ul>
                  <p className="text-muted-foreground">
                    El ciclo se repetirá automáticamente para que no tengas que preocuparte de nada.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Icons.Pause className="text-primary"/>Pausar el ciclo</h3>
                  <p className="text-muted-foreground">
                  Puedes <strong>Pausar</strong> el ciclo en cualquier momento si necesitas una parada no planificada. El progreso del ciclo se guardará y podrás reanudarlo cuando quieras.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Icons.Settings className="text-primary"/>Ajustes</h3>
                  <p className="text-muted-foreground">
                    Usa el ícono del engranaje en la esquina superior derecha para cambiar el tema (claro/oscuro), apoyar al desarrollador o encontrar información sobre la versión premium.
                  </p>
                </div>
                
                <div className="pt-4 text-center">
                  <Button asChild>
                    <Link href="/">
                        <Icons.Truck className="mr-2"/>
                        Volver a la App
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
