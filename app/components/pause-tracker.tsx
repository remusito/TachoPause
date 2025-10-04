'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Icons } from '@/components/icons';
import { useAchievements } from '@/hooks/use-achievements';

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
};

type TrafficLightState = 'idle' | 'yellow-start' | 'green' | 'yellow-warn' | 'red';

export function PauseTracker() {
  const [state, setState] = useState<TrafficLightState>('idle');
  const [countdown, setCountdown] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const { toast } = useToast();
  const { trackCycleStart } = useAchievements();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    setAudioUnlocked(true); // Set state immediately
    if (audioRef.current) {
      audioRef.current.muted = true; // Play silently to unlock
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        audioRef.current!.muted = false; // Unmute for future plays
        console.log("Audio desbloqueado por el usuario.");
      }).catch(error => {
        console.error("Fallo al desbloquear el audio:", error);
        setAudioUnlocked(false); // Revert on failure
      });
    }
  }

  const playSound = () => {
    if (audioRef.current && audioUnlocked) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Error al reproducir el sonido:", error);
      });
    } else {
        console.log("El audio no está desbloqueado. Se requiere interacción del usuario.");
    }
  };
  
  // Blinking effect for yellow states
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
          setState('green');
          setCountdown(50);
          playSound();
          toast({ title: '¡A conducir!', description: 'Periodo de conducción iniciado.' });
          break;
        case 'green':
          setState('yellow-warn');
          setCountdown(10);
          playSound();
          toast({ title: '¡Atención!', description: 'Prepárate para la pausa.', variant: 'destructive' });
          break;
        case 'yellow-warn':
          setState('red');
          setCountdown(60);
          toast({ title: 'Pausa Obligatoria', description: 'Tiempo de descanso.', variant: 'destructive' });
          break;
        case 'red':
          // Loop back to green
          trackCycleStart(); // A full cycle is completed when red is over.
          setState('green');
          setCountdown(50);
          playSound();
          toast({ title: '¡A conducir!', description: 'Periodo de conducción iniciado.' });
          break;
      }
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isActive, countdown, state, toast, audioUnlocked, trackCycleStart]);

  const handleToggle = () => {
    unlockAudio();
    if (isActive) {
      setIsActive(false);
      setState('idle');
      setCountdown(0);
    } else {
      setIsActive(true);
      setState('yellow-start');
      setCountdown(30);
      trackCycleStart(); // Track achievement on first start
    }
  };

  const handleReset = () => {
    unlockAudio();
    setIsActive(false);
    setState('idle');
    setCountdown(0);
    setIsBlinking(false);
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
      <Card className="w-full max-w-sm text-center border-none shadow-2xl bg-card/80 backdrop-blur-sm dark:bg-card/50" onClick={unlockAudio}>
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
          <div className="flex gap-4">
            <Button
              size="lg"
              className="w-32"
              onClick={handleToggle}
              variant={isActive ? 'secondary' : 'default'}
            >
              {isActive ? <Icons.Pause className="mr-2" /> : <Icons.Play className="mr-2" />}
              {isActive ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleReset}>
              <Icons.Refresh className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
    </>
  );
}
