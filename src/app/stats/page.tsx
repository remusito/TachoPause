
'use client';

import React, { useState } from 'react';
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
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { MainSidebar } from '../components/main-sidebar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const initialChartData = [
  { day: 'Lunes', driving: 8.5, pause: 1.5 },
  { day: 'Martes', driving: 9, pause: 1.75 },
  { day: 'Miércoles', driving: 7, pause: 1.25 },
  { day: 'Jueves', driving: 8, pause: 1.5 },
  { day: 'Viernes', driving: 9.5, pause: 2 },
  { day: 'Sábado', driving: 6, pause: 1 },
  { day: 'Domingo', driving: 0, pause: 0 },
];

const initialSummaryData = {
  distance: 3520,
  avgSpeed: 88,
  drivingHours: 125,
};

const zeroedData = {
  chart: [
    { day: 'Lunes', driving: 0, pause: 0 },
    { day: 'Martes', driving: 0, pause: 0 },
    { day: 'Miércoles', driving: 0, pause: 0 },
    { day: 'Jueves', driving: 0, pause: 0 },
    { day: 'Viernes', driving: 0, pause: 0 },
    { day: 'Sábado', driving: 0, pause: 0 },
    { day: 'Domingo', driving: 0, pause: 0 },
  ],
  summary: {
    distance: 0,
    avgSpeed: 0,
    drivingHours: 0,
  },
};


export default function StatsPage() {
    const [chartData, setChartData] = useState(initialChartData);
    const [summaryData, setSummaryData] = useState(initialSummaryData);
    const { toast } = useToast();

    const handleResetStats = () => {
        setChartData(zeroedData.chart);
        setSummaryData(zeroedData.summary);
        toast({
            title: 'Estadísticas Reiniciadas',
            description: 'Todos los datos han vuelto a cero.',
        });
    };

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-dvh bg-background text-foreground relative p-4 sm:p-6">
          <header className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Icons.Menu />
              </SidebarTrigger>
              <Icons.BarChart className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Estadísticas
              </h1>
            </div>
            <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icons.Refresh className="mr-2" />
                      Reiniciar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se reiniciarán todas tus estadísticas de conducción y pausas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetStats}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <SettingsSheet />
            </div>
          </header>
          <main className="w-full flex-1 flex flex-col items-center">
            <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Horas de Conducción vs. Pausa (Semanal)</CardTitle>
                        <CardDescription>Resumen de tu actividad en la última semana.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="min-h-64 w-full">
                            <RechartsBarChart data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis />
                                <Bar dataKey="driving" fill="var(--color-primary)" radius={4} />
                                <Bar dataKey="pause" fill="var(--color-secondary)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Icons.Milestone/> Distancia Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{summaryData.distance.toLocaleString('es-ES')} km</p>
                        <p className="text-sm text-muted-foreground">En los últimos 30 días</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Icons.Gauge/> Velocidad Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{summaryData.avgSpeed} km/h</p>
                        <p className="text-sm text-muted-foreground">En los últimos 30 días</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Icons.Timer/> Horas Conducidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{summaryData.drivingHours} h</p>
                        <p className="text-sm text-muted-foreground">En los últimos 30 días</p>
                    </CardContent>
                </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
