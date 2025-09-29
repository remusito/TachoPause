
'use client';

import React from 'react';
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

const chartData = [
  { day: 'Lunes', driving: 8.5, pause: 1.5 },
  { day: 'Martes', driving: 9, pause: 1.75 },
  { day: 'Miércoles', driving: 7, pause: 1.25 },
  { day: 'Jueves', driving: 8, pause: 1.5 },
  { day: 'Viernes', driving: 9.5, pause: 2 },
  { day: 'Sábado', driving: 6, pause: 1 },
  { day: 'Domingo', driving: 0, pause: 0 },
];

export default function StatsPage() {
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
                Estadísticas Avanzadas
              </h1>
            </div>
            <SettingsSheet />
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
                        <p className="text-4xl font-bold">3,520 km</p>
                        <p className="text-sm text-muted-foreground">En los últimos 30 días</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Icons.Gauge/> Velocidad Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">88 km/h</p>
                        <p className="text-sm text-muted-foreground">En los últimos 30 días</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Icons.Timer/> Horas Conducidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">125 h</p>
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
