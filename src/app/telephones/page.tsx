
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
import { MainSidebar } from '../components/main-sidebar';
import { Button } from '@/components/ui/button';
import { PremiumPlaceholder } from '../components/premium-placeholder';

// Datos de la captura
const telephoneData = [
  { name: 'MANOLO', extension: '2001' },
  { name: 'SAMUEL', extension: '2002' },
  { name: 'ORTEGA', extension: '2003' },
  { name: 'DELMI', extension: '2004' },
  { name: 'KRISTIAN', extension: '2005' },
  { name: 'IVAN', extension: '2006' },
  { name: 'ALONSO', extension: '2007' },
  { name: 'BENJA', extension: '2008' },
  { name: 'CARLOS', extension: '2009' },
  { name: 'TOMA', extension: '2010' },
  { name: 'MANOLIN', extension: '2011' },
  { name: 'VICTOR GARCIA', extension: '2012' },
  { name: 'JOAN', extension: '2013' },
  { name: 'LAGARDERA', extension: '2014' },
  { name: 'XAVI OFICINA', extension: '2015' },
  { name: 'V. VALLS', extension: '2016' },
  { name: 'WOJCIECH', extension: '2017' },
  { name: 'KRISTIAN TODOROV', extension: '2018' },
  { name: 'SERGIO', extension: '2019' },
  { name: 'RUBEN', extension: '2020' },
  { name: 'JULIAN', extension: '2021' },
  { name: 'KIKE', extension: '2022' },
  { name: 'RAFA JR', extension: '2023' },
  { name: 'PEPE', extension: '2024' },
  { name: 'NEDI', extension: '2025' },
  { name: 'MANOL', extension: '2026' },
  { name: 'RAUL', extension: '2027' },
  { name: 'ANGEL', extension: '2028' },
  { name: 'DAVID', extension: '2029' },
  { name: 'JAVI BRU', extension: '2030' },
  { name: 'IVAN SERQUERA', extension: '2031' },
  { name: 'PABLO', extension: '2032' },
  { name: 'INMA', extension: '2033' },
  { name: 'MASCLE', extension: '2034' },
  { name: 'JORDI', extension: '2035' },
  { name: 'YUBERO', extension: '2036' },
  { name: 'FERRAN', extension: '2037' },
  { name: 'VLADIMIR', extension: '2038' },
  { name: 'CRISTIAN', extension: '2039' },
  { name: 'JAVIER GARCIA', extension: '2040' },
];

export default function TelephonesPage() {

  const handleCall = (extension: string) => {
    window.location.href = `tel:${extension}`;
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
              <Icons.Phone className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Teléfonos de Contacto
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className="w-full flex-1 flex flex-col items-center">
             <PremiumPlaceholder
                title="Directorio Telefónico Premium"
                description="Accede a la lista de contactos de la empresa directamente desde la app."
             >
                <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Directorio Telefónico</CardTitle>
                    <CardDescription>Lista de extensiones importantes de la empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {telephoneData.map((contact, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                        <div className="flex items-center gap-4">
                            <Icons.Phone className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold">{contact.name}</p>
                                <p className="text-sm text-primary font-mono">{contact.extension}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleCall(contact.extension)}>
                            <Icons.Phone className="mr-2" />
                            Llamar
                        </Button>
                    </div>
                    ))}
                </CardContent>
                </Card>
            </PremiumPlaceholder>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
