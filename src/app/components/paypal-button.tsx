
'use client';

import React from 'react';
import {
  PayPalButtons,
  OnApproveData,
  OnApproveActions,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const PayPalButtonComponent: React.FC = () => {
  const { purchasePremium } = useAuth();
  const { toast } = useToast();
  const [{ isPending }] = usePayPalScriptReducer();

  const handleApprove = async (
    data: OnApproveData,
    actions: OnApproveActions
  ) => {
    try {
      if (actions.order) {
        const details = await actions.order.capture();
        console.log('Pago capturado:', details);

        // Safely call purchasePremium
        if (purchasePremium) {
          await purchasePremium();
          toast({
            title: '¡Pago completado!',
            description:
              'Has desbloqueado las funciones premium. ¡Gracias por tu apoyo!',
          });
        } else {
           throw new Error('La función de compra no está disponible.');
        }

      } else {
        throw new Error('No se pudo capturar la orden de PayPal.');
      }
    } catch (error) {
      console.error('Error al procesar el pago de PayPal:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      toast({
        variant: 'destructive',
        title: 'Error en el pago',
        description: `No se pudo completar la compra. ${errorMessage}`,
      });
    }
  };

  if (isPending) {
    return <Skeleton className="h-[48px] w-full" />;
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: 'Suscripción Premium TachoPause Optimizer',
                amount: {
                  value: '1.99', // El precio de tu suscripción
                  currency_code: 'EUR',
                },
              },
            ],
          });
        }}
        onApprove={handleApprove}
        onError={(err) => {
          console.error('Error en el botón de PayPal:', err);
          toast({
            variant: 'destructive',
            title: 'Error de PayPal',
            description:
              'No se pudo iniciar el proceso de pago. Si tienes un bloqueador de anuncios (AdBlock), desactívalo temporalmente e inténtalo de nuevo.',
          });
        }}
        onCancel={() => {
          toast({
            title: 'Pago cancelado',
            description: 'Has cancelado el proceso de pago.',
          });
        }}
      />
    </div>
  );
};

// Memoize the component to prevent re-renders that close the PayPal modal
export const PayPalButton = React.memo(PayPalButtonComponent);
