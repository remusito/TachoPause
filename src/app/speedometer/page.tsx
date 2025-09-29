'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SettingsSheet } from '../components/settings-sheet';
import { cn } from '@/lib/utils';
import { MainSidebar } from '../components/main-sidebar';
import { useAchievements } from '@/hooks/use-achievements';

type SpeedLog = {
  speed: number;
  timestamp: string;
};

// Helper to calculate distance between two lat/lon points in meters (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
};

export default function SpeedometerPage() {
  const [speed, setSpeed] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [speedLog, setSpeedLog] = useState<SpeedLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const speedSamplesRef = useRef<number[]>([]);

  const { updateAchievementProgress, incrementAchievementProgress } = useAchievements();

  const handleSuccess: PositionCallback = (position) => {
    const currentSpeed = position.coords.speed;
    const speedKmh = currentSpeed ? Math.round(currentSpeed * 3.6) : 0;
    
    setSpeed(speedKmh);
    setError(null);
    
    if (speedKmh > maxSpeed) {
      setMaxSpeed(speedKmh);
      updateAchievementProgress('speeder', speedKmh);
      updateAchievementProgress('supersonic', speedKmh);
    }

    // Add to log
    setSpeedLog((prevLog) => [
      { speed: speedKmh, timestamp: new Date().toLocaleTimeString() },
      ...prevLog,
    ]);

    // Calculate distance
    if (lastPositionRef.current) {
      const newDistance = calculateDistance(
        lastPositionRef.current.coords.latitude,
        lastPositionRef.current.coords.longitude,
        position.coords.latitude,
        position.coords.longitude
      );
      const newTotalDistance = distance + newDistance;
      setDistance(newTotalDistance);
      updateAchievementProgress('marathoner', newTotalDistance / 1000);
    }
    lastPositionRef.current = position;

    // Calculate average speed
    if (speedKmh > 0) {
      speedSamplesRef.current.push(speedKmh);
      const totalSpeed = speedSamplesRef.current.reduce((sum, s) => sum + s, 0);
      setAverageSpeed(Math.round(totalSpeed / speedSamplesRef.current.length));
    }
  };

  const handleError: PositionErrorCallback = (err) => {
    let errorMessage = 'Error desconocido al obtener la ubicación.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Permiso de geolocalización denegado.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Información de ubicación no disponible.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Se agotó el tiempo de espera para obtener la ubicación.';
        break;
    }
    setError(errorMessage);
    toast({
      title: 'Error de GPS',
      description: errorMessage,
      variant: 'destructive',
    });
    stopTracking(false);
  };

  const resetStats = () => {
      setSpeed(0);
      setMaxSpeed(0);
      setAverageSpeed(0);
      setDistance(0);
      setElapsedTime(0);
      setSpeedLog([]);
      setStartTime(null);
      lastPositionRef.current = null;
      speedSamplesRef.current = [];
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no es compatible con este navegador.');
      toast({
        title: 'Error de compatibilidad',
        description: 'La geolocalización no es compatible con este navegador.',
        variant: 'destructive',
      });
      return;
    }
    
    resetStats();
    setIsTracking(true);
    setStartTime(Date.now());
    toast({
      title: 'GPS Activado',
      description: 'Iniciando seguimiento de velocidad.',
    });
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopTracking = (showToast = true) => {
    setIsTracking(false);
    if (showToast) {
       toast({
        title: 'GPS Desactivado',
        description: 'Seguimiento de velocidad detenido.',
        variant: 'destructive',
      });
    }
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // Don't reset speed to 0 immediately, keep last value
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTracking && startTime) {
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setElapsedTime(elapsed);
        incrementAchievementProgress('explorer', 1); // Increment by 1 second
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking, startTime, incrementAchievementProgress]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex flex-col items-center justify-center min-h-dvh bg-background text-foreground relative">
           <header className="absolute top-0 left-0 w-full p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Icons.Menu />
              </SidebarTrigger>
              <Icons.Speedometer className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Velocímetro GPS
              </h1>
            </div>
            <SettingsSheet />
          </header>
          <main className='flex flex-1 flex-col items-center justify-center w-full px-4 gap-4 pt-20 pb-16'>
            <Card className="w-full max-w-sm text-center border-none shadow-2xl bg-card/80 backdrop-blur-sm dark:bg-card/50">
              <CardHeader>
                <CardTitle className="text-2xl">Velocidad Actual</CardTitle>
                 {error && <CardDescription className="text-destructive">{error}</CardDescription>}
              </CardHeader>
              <CardContent className="flex justify-center items-center py-4">
                <div className="relative w-56 h-56">
                   <svg className="w-full h-full" viewBox="0 0 250 250">
                    <circle cx="125" cy="125" r="100" className="stroke-border" strokeWidth="15" fill="transparent" />
                    <circle
                      cx="125"
                      cy="125"
                      r="100"
                      className={cn( 'transition-all duration-300', isTracking ? 'stroke-primary' : 'stroke-muted' )}
                      strokeWidth="15"
                      fill="transparent"
                      strokeDasharray="628.32"
                      strokeDashoffset={628.32 - (speed / 150) * 628.32} // Max speed 150km/h
                      strokeLinecap="round"
                      transform="rotate(-90 125 125)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-bold font-headline tracking-tighter text-primary">
                      {speed}
                    </span>
                    <span className="text-lg text-muted-foreground">km/h</span>
                  </div>
                </div>
              </CardContent>
               <CardFooter className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    className="w-48"
                    onClick={handleToggleTracking}
                    variant={isTracking ? 'destructive' : 'default'}
                  >
                    {isTracking ? <Icons.Pause className="mr-2" /> : <Icons.Play className="mr-2" />}
                    {isTracking ? 'Detener' : 'Iniciar'}
                  </Button>
              </CardFooter>
            </Card>

             <Card className="w-full max-w-sm">
                <CardContent className="p-4 grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Icons.Gauge className="h-6 w-6 text-primary"/>
                        <p className="text-xs text-muted-foreground">Vel. Máxima</p>
                        <p className="font-bold text-lg">{maxSpeed} <span className="text-sm font-normal">km/h</span></p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Icons.Gauge className="h-6 w-6 text-primary"/>
                        <p className="text-xs text-muted-foreground">Vel. Media</p>
                        <p className="font-bold text-lg">{averageSpeed} <span className="text-sm font-normal">km/h</span></p>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                        <Icons.Milestone className="h-6 w-6 text-primary"/>
                        <p className="text-xs text-muted-foreground">Distancia</p>
                        <p className="font-bold text-lg">{(distance / 1000).toFixed(2)} <span className="text-sm font-normal">km</span></p>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                        <Icons.Timer className="h-6 w-6 text-primary"/>
                        <p className="text-xs text-muted-foreground">Tiempo</p>
                        <p className="font-bold text-lg">{formatTime(elapsedTime)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Registro de Velocidad</CardTitle>
                </CardHeader>
                <CardContent className='p-2'>
                    <div className='h-24 overflow-y-auto space-y-2 p-2'>
                    {speedLog.length > 0 ? speedLog.map((log, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                            <span className="text-muted-foreground">{log.timestamp}</span>
                            <span className="font-semibold">{log.speed} km/h</span>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground pt-4">Inicia el seguimiento para ver el registro.</p>
                    )}
                    </div>
                </CardContent>
            </Card>
           </main>
           <footer className="w-full text-center p-4 absolute bottom-0">
            <p className="text-xs text-muted-foreground">
              La precisión de la velocidad depende del GPS de tu dispositivo.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
