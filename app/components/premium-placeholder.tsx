
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
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { PayPalButton } from "./paypal-button";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface PremiumPlaceholderProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const PremiumPlaceholder: React.FC<PremiumPlaceholderProps> = ({ children, title, description }) => {
  const { isPremium } = usePremium();
  const { user, loading } = useAuth();
  const router = useRouter();
  
  if (isPremium) {
    return <>{children}</>;
  }

  if (loading) {
    return (
        <div className="flex flex-1 items-center justify-center w-full">
            <Icons.Spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
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
            {user ? 'Esta función solo está disponible para usuarios Premium. Apoya el desarrollo para desbloquearla.' : 'Inicia sesión para desbloquear las funciones premium.'}
          </p>
          <div className="flex flex-col gap-2 justify-center">
            {user ? (
                 <PayPalButton />
            ) : (
                <Button onClick={() => router.push('/login')}>
                    <Icons.Login className="mr-2"/>
                    Iniciar Sesión
                </Button>
            )}
          </div>
           <p className="text-xs text-muted-foreground pt-2">
              Un único pago para desbloquear todas las funciones para siempre.
            </p>
        </CardContent>
      </Card>
    </div>
  );
};
