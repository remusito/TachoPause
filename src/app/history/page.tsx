
'use client';

import React, { useMemo } from 'react';
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
import { useAuth } from '@/firebase';
import { useCollection } from '@/hooks/use-collection';
import { collection, orderBy, query, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryItem {
    id: string;
    timestamp: { toDate: () => Date };
    type: 'conduccion' | 'pausa';
    duration: number;
    distance?: number;
    status: 'completado' | 'interrumpido';
}

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const db = useFirestore();

  const historyQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
        collection(db, `users/${user.uid}/history`), 
        orderBy('timestamp', 'desc'),
        limit(50)
    );
  }, [user, db]);

  const { data: historyData, loading, error } = useCollection<HistoryItem>(historyQuery);

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
                      <TableHead>Hace</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Distancia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={5} className='text-center'>
                                <Icons.Spinner className="animate-spin h-6 w-6 mx-auto my-8"/>
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && !user && (
                         <TableRow>
                            <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                                Inicia sesión para ver tu historial.
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && user && historyData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                                Aún no tienes actividad registrada.
                            </TableCell>
                        </TableRow>
                    )}
                    {error && (
                        <TableRow>
                             <TableCell colSpan={5} className='text-center text-destructive py-8'>
                                Error al cargar el historial: {error.message}
                            </TableCell>
                        </TableRow>
                    )}
                    {historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true, locale: es })}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === 'conduccion' ? 'default' : 'secondary'}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(item.duration)}</TableCell>
                        <TableCell>{item.distance ? `${item.distance.toFixed(2)} km` : '-'}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-2 ${item.status === 'interrumpido' ? 'text-yellow-500' : 'text-green-500'}`}>
                            <span className={`h-2 w-2 rounded-full ${item.status === 'interrumpido' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
