'use server';

import { calculatePauseTime } from '@/ai/flows/calculate-pause-time';
import type { CalculatePauseTimeOutput } from '@/ai/flows/calculate-pause-time';

export async function getUpdatedPauseTime(
  pauseTimeRemainingSeconds: number,
  movementDurationSeconds: number
): Promise<CalculatePauseTimeOutput & { error?: string }> {
  if (movementDurationSeconds <= 0) {
    return { updatedPauseTimeRemainingSeconds: pauseTimeRemainingSeconds };
  }
  
  if (movementDurationSeconds >= 60) {
    // This case should be handled on the client, but as a safeguard:
    return { updatedPauseTimeRemainingSeconds: 0 };
  }

  try {
    const result = await calculatePauseTime({
      pauseTimeRemainingSeconds,
      movementDurationSeconds,
    });
    return result;
  } catch (e) {
    console.error(e);
    // Provide a more specific error message if possible
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      updatedPauseTimeRemainingSeconds: pauseTimeRemainingSeconds,
      error: `Error al calcular el tiempo de pausa: ${errorMessage}`,
    };
  }
}
