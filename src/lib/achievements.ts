import { Icons } from '@/components/icons';
import type React from 'react';

export type AchievementId =
  | 'first_use'
  | 'early_bird'
  | 'night_owl'
  | 'consistency_5_days'
  | 'speeder'
  | 'supersonic'
  | 'marathoner'
  | 'time_master'
  | 'explorer'
  | 'tutorial_guru'
  | 'premium_supporter'
  | 'sharer';

export type Achievement = {
  id: AchievementId;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  goal: number; // The target value to unlock the achievement
  isSecret?: boolean;
};

export const allAchievements: Achievement[] = [
  {
    id: 'first_use',
    icon: Icons.Star,
    title: 'Novato de la Carretera',
    description: 'Usa la app por primera vez.',
    goal: 1,
  },
  {
    id: 'premium_supporter',
    icon: Icons.HeartHandshake,
    title: 'Colaborador Premium',
    description: 'Apoya el desarrollo comprando la versión premium.',
    goal: 1,
  },
  {
    id: 'sharer',
    icon: Icons.Share,
    title: 'Embajador de la Carretera',
    description: 'Comparte la aplicación con un amigo.',
    goal: 1,
  },
  {
    id: 'early_bird',
    icon: Icons.Sunrise,
    title: 'Madrugador',
    description: 'Inicia un ciclo antes de las 6 AM.',
    goal: 1,
  },
  {
    id: 'night_owl',
    icon: Icons.Moon,
    title: 'Nocturno',
    description: 'Inicia un ciclo después de las 10 PM.',
    goal: 1,
  },
  {
    id: 'consistency_5_days',
    icon: Icons.History,
    title: 'Constancia',
    description: 'Usa la app 5 días seguidos.',
    goal: 5,
  },
  {
    id: 'speeder',
    icon: Icons.Zap,
    title: 'Velocista',
    description: 'Alcanza los 90 km/h.',
    goal: 90,
  },
  {
    id: 'supersonic',
    icon: Icons.Trophy,
    title: 'Supersónico',
    description: 'Alcanza los 120 km/h.',
    goal: 120,
  },
  {
    id: 'marathoner',
    icon: Icons.Milestone,
    title: 'Maratonista',
    description: 'Acumula 100 km en un solo viaje.',
    goal: 100,
  },
  {
    id: 'time_master',
    icon: Icons.Timer,
    title: 'Maestro del Tiempo',
    description: 'Completa 10 ciclos en un día.',
    goal: 10,
  },
  {
    id: 'explorer',
    icon: Icons.Speedometer,
    title: 'Explorador',
    description: 'Usa el velocímetro GPS por más de 1 hora.',
    goal: 3600, // seconds
  },
  {
    id: 'tutorial_guru',
    icon: Icons.BookOpen,
    title: 'Gurú del Tutorial',
    description: 'Visita la página del tutorial.',
    goal: 1,
  },
];
