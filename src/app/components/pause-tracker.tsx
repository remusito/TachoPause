'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Icons } from '@/components/icons';
import { useAchievements } from '@/hooks/use-achievements-provider';
import { useAuth, useFirestore } from '@/firebase';
import { addHistoryItem } from '@/lib/data';

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
};

type TrafficLightState = 'idle' | 'yellow-start' | 'green' | 'yellow-warn' | 'red';
type ActivityType = 'conduccion' | 'pausa';

export function PauseTracker() {
  const [state, setState] = useState<TrafficLightState>('idle');
  const [countdown, setCountdown] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const auth = useAuth();
  const user = auth?.user;
  const db = useFirestore();
  const { trackCycleStart } = useAchievements();
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'click' | 'alert') => {
    if (!audioContextRef.current) return;

    audioContextRef.current.resume().then(() => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);

        if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioContextRef.current!.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContextRef.current!.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.1);
        } else {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(880, audioContextRef.current!.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current!.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.2);
        }

        oscillator.start(audioContextRef.current!.currentTime);
        oscillator.stop(audioContextRef.current!.currentTime + 0.2);
    }).catch(console.error);
  };

  const logActivity = (type: ActivityType, duration: number, status: 'completado' | 'interrumpido') => {
    if (user && db) {
      addHistoryItem(db, user.uid, {
        type,
        duration,
        status,
        distance: 0,
      });
    }
  };

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;
    if (isActive && (state === 'yellow-start' || state === 'yellow-warn')) {
      blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 500);
    } else {
      setIsBlinking(false);
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [isActive, state]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (isActive && countdown > 0) {
      timerInterval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isActive && countdown === 0) {
      // State transitions
      switch (state) {
        case 'yellow-start':
          playSound('alert');
          setState('green');
          setCountdown(50);
          logActivity('pausa', 30, 'completado');
          break;
        case 'green':
          playSound('alert');
          setState('yellow-warn');
          setCountdown(10);
          logActivity('conduccion', 50, 'completado');
          break;
        case 'yellow-warn':
          playSound('alert');
          setState('red');
          setCountdown(60);
          logActivity('conduccion', 10, 'completado');
          break;
        case 'red':
          trackCycleStart();
          playSound('alert');
          setState('green');
          setCountdown(50);
          logActivity('pausa', 60, 'completado');
          break;
      }
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isActive, countdown, state, trackCycleStart]);

  const primeAudio = () => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  }

  const handleToggle = () => {
    primeAudio();
    
    if (isActive) {
      // Logic for interrupting an active cycle
      const currentStateDuration = state === 'yellow-start' ? 30 : state === 'green' ? 50 : state === 'yellow-warn' ? 10 : 60;
      const elapsedTime = currentStateDuration - countdown;
      if (elapsedTime > 0) {
        const activityType: ActivityType = (state === 'red' || state === 'yellow-start') ? 'pausa' : 'conduccion';
        logActivity(activityType, elapsedTime, 'interrumpido');
      }
      setIsActive(false);
      setState('idle');
      setCountdown(0);
    } else {
      playSound('click');
      setIsActive(true);
      setState('yellow-start');
      setCountdown(30);
      if(user) trackCycleStart();
    }
  };

  const { color, textClass, progress, icon, stateText } = useMemo(() => {
    switch (state) {
      case 'yellow-start':
        return { color: 'stroke-yellow-500', textClass: 'text-yellow-500', progress: (30 - countdown) / 30 * 100, icon: <Icons.AlertTriangle className="h-8 w-8 text-yellow-500" />, stateText: 'Espere' };
      case 'green':
        return { color: 'stroke-green-500', textClass: 'text-green-500', progress: (50 - countdown) / 50 * 100, icon: <Icons.Truck className="h-8 w-8 text-green-500" />, stateText: 'Adelante' };
      case 'yellow-warn':
        return { color: 'stroke-yellow-500', textClass: 'text-yellow-500', progress: (10 - countdown) / 10 * 100, icon: <Icons.AlertTriangle className="h-8 w-8 text-yellow-500" />, stateText: 'Atención' };
      case 'red':
        return { color: 'stroke-destructive', textClass: 'text-destructive', progress: (60 - countdown) / 60 * 100, icon: <Icons.Pause className="h-8 w-8 text-destructive" />, stateText: 'Deténgase' };
      default:
        return { color: 'stroke-primary', textClass: 'text-foreground', progress: 0, icon: null, stateText: '' };
    }
  }, [state, countdown]);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = useMemo(() => circumference - (progress / 100) * circumference, [progress, circumference]);

  return (
    <>
      <Card 
        className="w-full max-w-sm text-center border-none shadow-2xl bg-card/80 backdrop-blur-sm dark:bg-card/50" 
      >
        <CardHeader>
           <CardTitle className="text-2xl">Control de Conducción</CardTitle>
           {isActive && stateText && (
             <p className={cn("text-lg font-semibold animate-pulse", textClass)}>
               {stateText}
             </p>
           )}
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full" viewBox="0 0 250 250">
              <circle
                cx="125"
                cy="125"
                r={radius}
                className="stroke-border"
                strokeWidth="15"
                fill="transparent"
              />
              <circle
                cx="125"
                cy="125"
                r={radius}
                className={cn(
                  'transition-all duration-1000 ease-linear',
                   color
                )}
                strokeWidth="15"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                transform="rotate(-90 125 125)"
              />
            </svg>
            <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-opacity",
              isBlinking ? 'opacity-50' : 'opacity-100'
            )}>
              <span className={cn("text-5xl font-bold tabular-nums font-headline tracking-tighter", textClass)}>
                {formatTime(countdown)}
              </span>
              <div className="h-10 mt-2 flex items-center justify-center">
                {icon ? icon : <span className="text-sm text-muted-foreground">Presiona Iniciar</span>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="w-40"
              onClick={handleToggle}
              variant={isActive ? 'secondary' : 'default'}
              disabled={!user}
            >
              {isActive ? <Icons.Pause className="mr-2" /> : <Icons.Play className="mr-2" />}
              {isActive ? 'Pausar' : 'Iniciar'}
            </Button>
          </div>
           {!user && <p className="text-xs text-muted-foreground">Inicia sesión para guardar tu actividad</p>}
        </CardFooter>
      </Card>
    </>
  );
}
