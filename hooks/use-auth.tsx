
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    User, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';
import type { SignUpFormValues, SignInFormValues } from '@/app/login/page';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailPassword: (values: SignUpFormValues) => Promise<{ success: boolean, error?: string }>;
  signInWithEmailPassword: (values: SignInFormValues) => Promise<{ success: boolean, error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
             return 'Correo electrónico o contraseña incorrectos.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Inténtalo de nuevo más tarde.';
        default:
            return 'Ha ocurrido un error inesperado.';
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      })
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      const errorMessage = error instanceof Error ? getAuthErrorMessage(error as AuthError) : 'Un error desconocido ocurrió.';
      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive"
      })
    }
  };
  
  const signUpWithEmailPassword = async (values: SignUpFormValues): Promise<{ success: boolean, error?: string }> => {
    try {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({
            title: "¡Cuenta creada!",
            description: "Has sido registrado correctamente.",
        });
        return { success: true };
    } catch (error) {
        console.error("Error signing up: ", error);
        const errorMessage = getAuthErrorMessage(error as AuthError);
        return { success: false, error: errorMessage };
    }
  }

  const signInWithEmailPassword = async (values: SignInFormValues): Promise<{ success: boolean, error?: string }> => {
    try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
            title: "¡Bienvenido de nuevo!",
            description: "Has iniciado sesión correctamente.",
        });
        return { success: true };
    } catch (error) {
        console.error("Error signing in: ", error);
        const errorMessage = getAuthErrorMessage(error as AuthError);
        return { success: false, error: errorMessage };
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      })
    } catch (error) {
      console.error("Error signing out: ", error);
       toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive"
      })
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmailPassword, signInWithEmailPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
