
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/use-premium';
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
import { useAchievements } from '@/hooks/use-achievements';

const formatRemainingTime = (expiry: number | null) => {
    if (expiry === null) return 'Permanente';
    if (!expiry) return '00:00:00';
    
    const remaining = Math.max(0, expiry - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


export function SettingsSheet() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [cheatCode, setCheatCode] = useState('');
  const { isPremium, unlockPremium, unlockExpiry, purchasePremium } = usePremium();
  const { unlockAchievement } = useAchievements();
  const [remainingTime, setRemainingTime] = useState(formatRemainingTime(unlockExpiry));
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPremium) {
      setRemainingTime(formatRemainingTime(unlockExpiry)); // Update immediately
      if (unlockExpiry) { // Only set interval if there's a temporary expiry
          interval = setInterval(() => {
            const newTime = formatRemainingTime(unlockExpiry);
            if (newTime === '00:00:00') {
                // When time is up, it might take a moment for usePremium to re-check,
                // so we can clear the display here.
                setRemainingTime('Expirado');
                clearInterval(interval);
            } else {
                setRemainingTime(newTime);
            }
          }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isPremium, unlockExpiry]);


  // Assuming version is from package.json, which is not directly accessible on client.
  // Hardcoding for now. A better approach would be to expose it via build process.
  const appVersion = '1.0.1-dev';

  const handleDonate = () => {
    const paypalUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rcerezomartin@gmail.com&item_name=Apoyo+TachoPause+Optimizer&amount=1.99&currency_code=EUR';
    window.open(paypalUrl, '_blank');
    toast({
      title: 'Gracias por tu apoyo',
      description: 'Una vez completado el pago, recibirás tu código de activación por privado.',
    });
  };

  const handleActivateCode = () => {
    if (cheatCode.toLowerCase() === 'desmayao') {
      unlockPremium('DESMAYAO');
      unlockAchievement('first_use');
      setCheatCode('');
    } else if (cheatCode.toLowerCase() === 'desmayaototal'){
      unlockPremium('DESMAYAOTOTAL');
      setCheatCode('');
    } else {
        toast({
            title: 'Código incorrecto',
            description: 'El código secreto introducido no es válido.',
            variant: 'destructive',
        });
    }
  };

  const handleShare = async () => {
    const shareData = {
        title: 'TachoPause Optimizer',
        text: '¡Ey! Echa un vistazo a esta app para optimizar los tiempos de descanso de los camioneros. ¡Es genial!',
        url: window.location.origin,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            
        } else {
            // Fallback for desktop or browsers that don't support navigator.share
            await navigator.clipboard.writeText(shareData.url);
            toast({
                title: 'Enlace copiado',
                description: '¡El enlace a la aplicación se ha copiado a tu portapapeles!',
            });
        }
        unlockAchievement('sharer');
    } catch (err) {
        console.error('Error al compartir:', err);
        toast({
            title: 'Error',
            description: 'No se pudo compartir la aplicación.',
            variant: 'destructive',
        });
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
              Modo Premium activado. {unlockExpiry ? `Tiempo restante: ${remainingTime}` : ''}
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
          
          <div className="space-y-4">
             <Label>Apoyar y Compartir</Label>
             <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <Button onClick={handleDonate} className="w-full" variant="secondary">
                    <Icons.Premium className="mr-2" /> Comprar Premium
                </Button>
                 <Button onClick={handleShare} className="w-full" variant="outline">
                    <Icons.Share className="mr-2" /> Compartir App
                </Button>
             </div>
             <p className="text-xs text-center text-muted-foreground -mt-2">
              Un único pago para desbloquear todo para siempre.
            </p>
          </div>

          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="outline">Introducir Código Secreto</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Código Secreto</AlertDialogTitle>
                  <AlertDialogDescription>
                      Introduce el código secreto para desbloquear las funciones premium.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                      id="cheat-code"
                      type="text"
                      value={cheatCode}
                      onChange={(e) => setCheatCode(e.target.value)}
                      placeholder="************"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                              handleActivateCode();
                              document.getElementById('cheat-code-cancel')?.click();
                          }
                      }}
                  />
                  <AlertDialogFooter>
                  <AlertDialogCancel id="cheat-code-cancel">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleActivateCode}>Activar</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
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
