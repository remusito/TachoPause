'use server';

/**
 * @fileOverview Calculates the remaining pause time when moving the truck briefly, according to the one-minute rule.
 *
 * - calculatePauseTime - A function that calculates remaining pause time.
 * - CalculatePauseTimeInput - The input type for the calculatePauseTime function.
 * - CalculatePauseTimeOutput - The return type for the calculatePauseTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculatePauseTimeInputSchema = z.object({
  pauseTimeRemainingSeconds: z
    .number()
    .describe('The amount of break time remaining in seconds.'),
  movementDurationSeconds: z
    .number()
    .describe('The duration of the truck movement in seconds.'),
});
export type CalculatePauseTimeInput = z.infer<typeof CalculatePauseTimeInputSchema>;

const CalculatePauseTimeOutputSchema = z.object({
  updatedPauseTimeRemainingSeconds: z
    .number()
    .describe(
      'The updated amount of break time remaining in seconds after applying the one-minute rule.'
    ),
});
export type CalculatePauseTimeOutput = z.infer<typeof CalculatePauseTimeOutputSchema>;

export async function calculatePauseTime(
  input: CalculatePauseTimeInput
): Promise<CalculatePauseTimeOutput> {
  return calculatePauseTimeFlow(input);
}

const calculatePauseTimePrompt = ai.definePrompt({
  name: 'calculatePauseTimePrompt',
  input: {schema: CalculatePauseTimeInputSchema},
  output: {schema: CalculatePauseTimeOutputSchema},
  prompt: `You are a time calculation expert, specifically for trucking regulations.

The user is on a break, and needs to move their truck. According to trucking regulations, brief movements of the truck (less than a minute) do not necessarily invalidate the break. Please calculate the new amount of break time remaining after the movement.

Original pause time remaining (seconds): {{{pauseTimeRemainingSeconds}}}
Movement duration (seconds): {{{movementDurationSeconds}}}

Calculate the updated pause time remaining, assuming that the movement does not invalidate the break according to the one-minute rule. Return the updated pause time in seconds. Do not consider a movement duration greater than 60 seconds.`,
});

const calculatePauseTimeFlow = ai.defineFlow(
  {
    name: 'calculatePauseTimeFlow',
    inputSchema: CalculatePauseTimeInputSchema,
    outputSchema: CalculatePauseTimeOutputSchema,
  },
  async input => {
    const {output} = await calculatePauseTimePrompt(input);
    return output!;
  }
);
