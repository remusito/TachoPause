'use client';

import { usePremium } from "@/hooks/use-premium";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";

interface PremiumPlaceholderProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const PremiumPlaceholder: React.FC<PremiumPlaceholderProps> = ({ children, title, description }) => {
  const { isPremium, unlockPremium, purchasePremium } = usePremium();
  const { toast } = useToast();
  const [cheatCode, setCheatCode] = useState('');

  const handleDonate = () => {
    // This is a simulation. In a real app, you'd handle the purchase flow.
    // After a successful "purchase", call purchasePremium()
    purchasePremium();
    toast({
      title: '¡Gracias por tu apoyo!',
      description: 'Has desbloqueado permanentemente las funciones Premium.',
    });
    window.open('https://paypal.me/rcerezomartin', '_blank');
  };

  const handleActivateCode = () => {
     if (cheatCode.toLowerCase() === 'desmayao') {
      unlockPremium('DESMAYAO');
      toast({
        title: '¡Funciones Premium Desbloqueadas!',
        description: 'Disfruta de todas las funciones premium durante 2 horas.',
      });
      setCheatCode('');
    } else if (cheatCode.toLowerCase() === 'desmayaototal'){
      unlockPremium('DESMAYAOTOTAL');
      toast({
        title: '¡Funciones Premium Desbloqueadas!',
        description: 'Has desbloqueado la versión completa. ¡Disfrútala!',
      });
       setCheatCode('');
    } else {
        toast({
            title: 'Código incorrecto',
            description: 'El código secreto introducido no es válido.',
            variant: 'destructive',
        });
    }
  };

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Icons.Premium className="h-6 w-6 text-primary" />
            Función Premium
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta función solo está disponible para usuarios Premium. Apoya el desarrollo para desbloquearla.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={handleDonate} size="lg">
              <Icons.Premium className="mr-2" />
              Apoyar con PayPal
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg">Introducir Código</Button>
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
                                document.getElementById('premium-code-cancel')?.click();
                            }
                        }}
                    />
                    <AlertDialogFooter>
                    <AlertDialogCancel id="premium-code-cancel">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleActivateCode}>Activar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
