
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, getAuthErrorMessage } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import type { AuthError } from 'firebase/auth';

const signInSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });
export type SignUpFormValues = z.infer<typeof signUpSchema>;


export default function LoginPage() {
  const { user, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });
  
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);


  async function onSignIn(data: SignInFormValues) {
    setIsLoading(true);
    if (!signInWithEmail) {
        toast({ title: 'Error', description: 'El servicio de autenticación no está listo.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error de inicio de sesión',
        description: getAuthErrorMessage(error as AuthError),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignUp(data: SignUpFormValues) {
    setIsLoading(true);
    if (!signUpWithEmail) {
        toast({ title: 'Error', description: 'El servicio de registro no está listo.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    try {
      await signUpWithEmail(data.email, data.password);
      toast({
        title: "¡Cuenta creada!",
        description: "Has sido registrado correctamente.",
      });
       router.push('/');
    } catch (error) {
       toast({
        title: 'Error de registro',
        description: getAuthErrorMessage(error as AuthError),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    if (!signInWithGoogle) {
      toast({ title: 'Error', description: 'El servicio de autenticación no está listo.', variant: 'destructive' });
      setIsGoogleLoading(false);
      return;
    }
    try {
      await signInWithGoogle();
      // The redirect will happen and the result will be handled by the AuthProvider
    } catch (error) {
      toast({
        title: 'Error de inicio de sesión con Google',
        description: getAuthErrorMessage(error as AuthError),
        variant: 'destructive',
      });
       setIsGoogleLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground p-4">
        <div className='absolute top-4 left-4'>
            <Button asChild variant="ghost">
                <Link href="/">
                    <Icons.Truck className='mr-2'/> Volver
                </Link>
            </Button>
        </div>
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="signup">Registrarse</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
              <CardDescription>
                Introduce tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Icons.Spinner className="mr-2 animate-spin" />}
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continuar con
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                {isGoogleLoading && <Icons.Spinner className="mr-2 animate-spin" />}
                <Icons.Login className="mr-2"/> Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
              <CardDescription>
                Introduce tu correo y contraseña para registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repite la contraseña" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Icons.Spinner className="mr-2 animate-spin" />}
                    Crear Cuenta
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
