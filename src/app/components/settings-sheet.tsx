'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/use-premium';
import { useAchievements } from '@/hooks/use-achievements';
import { PayPalButton } from '@/app/components/paypal-button';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export function SettingsSheet() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { isPremium } = usePremium();
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();
  const { unlockAchievement } = useAchievements();
  
  // Assuming version is from package.json, which is not directly accessible on client.
  // Hardcoding for now. A better approach would be to expose it via build process.
  const appVersion = '1.0.1-dev';


  const handleShare = async () => {
    const shareData = {
      title: 'TachoPause Optimizer',
      text: '¡Ey! Echa un vistazo a esta app para optimizar los tiempos de descanso de los camioneros. ¡Es genial!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        unlockAchievement('sharer');
      } catch (err: any) {
        // Ignore abort errors which happen when the user cancels the share sheet
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error('Error al compartir:', err);
           try {
            await navigator.clipboard.writeText(shareData.url);
            toast({
              title: 'Enlace copiado',
              description: '¡No se pudo compartir, pero se ha copiado el enlace al portapapeles!',
            });
            unlockAchievement('sharer');
          } catch (clipErr) {
            console.error('Error al copiar al portapapeles:', clipErr);
            toast({
              title: 'Error',
              description: 'No se pudo compartir ni copiar el enlace.',
              variant: 'destructive',
            });
          }
        }
      }
    } else {
      // Fallback for desktop or browsers that don't support navigator.share
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Enlace copiado',
          description: '¡El enlace a la aplicación se ha copiado a tu portapapeles!',
        });
        unlockAchievement('sharer');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        toast({
          title: 'Error',
          description: 'No se pudo copiar el enlace.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.Settings className="h-6 w-6" />
          <span className="sr-only">Abrir ajustes</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Ajustes</SheetTitle>
           {isPremium && (
            <SheetDescription className="text-primary font-bold">
              Modo Premium activado. ¡Gracias por tu apoyo!
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="theme-selector">
              Tema
            </Label>
            <Select
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger id="theme-selector" className="w-full">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isPremium && (
            <div className="space-y-4 rounded-lg border p-4">
              <Label className='text-lg font-semibold flex items-center gap-2'><Icons.Premium className='text-primary'/> Desbloquear Premium</Label>
              <p className="text-sm text-muted-foreground">
                Consigue acceso a todas las funciones y apoya el desarrollo de la app con un único pago.
              </p>
              {user ? (
                <PayPalButton />
              ) : (
                <Button className='w-full' onClick={() => {
                  const trigger = document.querySelector('[data-radix-collection-item] > button');
                  if (trigger instanceof HTMLElement) {
                    trigger.click(); // close the sheet
                  }
                  router.push('/login')
                }}>
                  Iniciar Sesión para comprar
                </Button>
              )}
            </div>
          )}

           <div className="space-y-2">
             <Label>Compartir</Label>
             <Button onClick={handleShare} className="w-full" variant="outline">
                <Icons.Share className="mr-2" /> Compartir App
            </Button>
          </div>
        </div>
        <SheetFooter>
          <div className="text-center text-xs text-muted-foreground w-full">
            Versión de la aplicación: {appVersion}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
