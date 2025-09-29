
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
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MainSidebar } from '../components/main-sidebar';


// Mock data for demonstration purposes
const historyData = [
  { date: '2024-07-28', type: 'Conducción', duration: '4h 30m', distance: '412 km', status: 'Completado' },
  { date: '2024-07-28', type: 'Pausa', duration: '0h 45m', distance: '0 km', status: 'Completado' },
  { date: '2024-07-27', type: 'Conducción', duration: '5h 15m', distance: '480 km', status: 'Completado' },
  { date: '2024-07-27', type: 'Pausa', duration: '1h 00m', distance: '0 km', status: 'Completado' },
  { date: '2024-07-26', type: 'Conducción', duration: '3h 50m', distance: '350 km', status: 'Interrumpido' },
];

export default function HistoryPage() {
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
              <Icons.History className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Historial de Actividad
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className="w-full flex-1 flex flex-col items-center">
            <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle>Registros de actividad</CardTitle>
                <CardDescription>Aquí puedes ver tus ciclos de conducción y pausas guardados.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Distancia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === 'Conducción' ? 'default' : 'secondary'}>{item.type}</Badge>
                        </TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell>{item.distance}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-2 ${item.status === 'Interrumpido' ? 'text-destructive' : 'text-green-500'}`}>
                            <span className={`h-2 w-2 rounded-full ${item.status === 'Interrumpido' ? 'bg-destructive' : 'bg-green-500'}`}></span>
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
