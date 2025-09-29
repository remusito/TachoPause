
'use server';

/**
 * @fileOverview Calculates route distance and estimated time for a truck for multiple segments.
 *
 * - calculateRouteDetails - A function that calculates distance and travel time for a single segment.
 * - calculateMultipleRouteDetails - A function that calculates the total distance and time for multiple route segments.
 * - CalculateRouteDetailsInput - The input type for the calculateRouteDetails function.
 * - CalculateRouteDetailsOutput - The return type for the calculateRouteDetails function.
 * - CalculateMultipleRouteDetailsInput - The input type for the calculateMultipleRouteDetails function.
 * - CalculateMultipleRouteDetailsOutput - The return type for the calculateMultipleRouteDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {Client} from '@googlemaps/google-maps-services-js';

const RouteDetailSchema = z.object({
  origin: z.string().describe('The starting point of the route segment.'),
  destination: z.string().describe('The final destination of the route segment.'),
});
export type RouteDetail = z.infer<typeof RouteDetailSchema>;


const CalculateRouteDetailsInputSchema = z.object({
  origin: z.string().describe('The starting point of the route.'),
  destination: z.string().describe('The final destination of the route.'),
});
export type CalculateRouteDetailsInput = z.infer<typeof CalculateRouteDetailsInputSchema>;


const CalculateRouteDetailsOutputSchema = z.object({
  distance: z.string().describe('The total distance of the route in kilometers.'),
  duration: z.string().describe('The estimated travel time, calculated for a truck.'),
  distanceKm: z.number().describe('The distance in kilometers (numeric value).'),
  durationMinutes: z.number().describe('The duration in minutes (numeric value).'),
});
export type CalculateRouteDetailsOutput = z.infer<typeof CalculateRouteDetailsOutputSchema>;

const CalculateMultipleRouteDetailsInputSchema = z.object({
  routeDetails: z.array(RouteDetailSchema),
});
export type CalculateMultipleRouteDetailsInput = z.infer<typeof CalculateMultipleRouteDetailsInputSchema>;

const CalculateMultipleRouteDetailsOutputSchema = z.object({
  totalDistance: z.string().describe('The total distance of all route segments combined.'),
  totalDuration: z.string().describe('The total estimated travel time for all segments.'),
  segments: z.array(CalculateRouteDetailsOutputSchema).describe('The breakdown of each segment.'),
});
export type CalculateMultipleRouteDetailsOutput = z.infer<typeof CalculateMultipleRouteDetailsOutputSchema>;


async function calculateSingleRoute(input: CalculateRouteDetailsInput): Promise<CalculateRouteDetailsOutput> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your .env file.");
  }
  const client = new Client({});
  const TRUCK_AVG_SPEED_KMH = 70;

  try {
    const directionsResponse = await client.directions({
      params: {
        origin: input.origin,
        destination: input.destination,
        key: apiKey,
      },
    });

    if (directionsResponse.data.routes.length === 0) {
      throw new Error(`No route could be found between ${input.origin} and ${input.destination}.`);
    }

    const route = directionsResponse.data.routes[0];
    const leg = route.legs[0];

    if (!leg || !leg.distance || !leg.distance.value) {
      throw new Error('Could not retrieve distance for the route.');
    }
      
    const distanceMeters = leg.distance.value;
    const distanceKm = distanceMeters / 1000;

    const durationHours = distanceKm / TRUCK_AVG_SPEED_KMH;
    const totalMinutes = durationHours * 60;
      
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return {
      distance: `${distanceKm.toFixed(0)} km`,
      duration: `${hours}h ${minutes}m`,
      distanceKm: distanceKm,
      durationMinutes: totalMinutes,
    };

  } catch (e: any) {
    console.error('Error calling Google Maps API:', e.response?.data?.error_message || e.message);
    // Rethrow a more specific error
    throw new Error(`Failed to calculate route from ${input.origin} to ${input.destination}. Reason: ${e.response?.data?.error_message || e.message}`);
  }
}

export const calculateMultipleRouteDetails = ai.defineFlow(
  {
    name: 'calculateMultipleRouteDetailsFlow',
    inputSchema: CalculateMultipleRouteDetailsInputSchema,
    outputSchema: CalculateMultipleRouteDetailsOutputSchema,
  },
  async ({ routeDetails }) => {
    let totalDistanceKm = 0;
    let totalDurationMinutes = 0;

    const segmentPromises = routeDetails.map(route => 
      calculateSingleRoute({ origin: route.origin, destination: route.destination })
    );

    const segments = await Promise.all(segmentPromises);

    for (const segment of segments) {
      totalDistanceKm += segment.distanceKm;
      totalDurationMinutes += segment.durationMinutes;
    }

    const totalHours = Math.floor(totalDurationMinutes / 60);
    const remainingMinutes = Math.round(totalDurationMinutes % 60);

    return {
      totalDistance: `${totalDistanceKm.toFixed(0)} km`,
      totalDuration: `${totalHours}h ${remainingMinutes}m`,
      segments: segments,
    };
  }
);
