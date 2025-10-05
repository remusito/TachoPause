'use server';

/**
 * @fileOverview A service area finder for routes using Google Maps API.
 *
 * - findServiceAreas - Finds service areas along a route.
 * - FindServiceAreasInput - Input type.
 * - FindServiceAreasOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Client, Place } from '@googlemaps/google-maps-services-js';
import { decode } from '@googlemaps/polyline-codec';

const FindServiceAreasInputSchema = z.object({
  currentLocation: z.string().describe('The current location of the driver.'),
  destination: z.string().describe('The final destination.'),
});
export type FindServiceAreasInput = z.infer<typeof FindServiceAreasInputSchema>;

const FindServiceAreasOutputSchema = z.object({
  routeSummary: z.string().describe('A summary of the route.'),
  serviceAreas: z.array(
    z.object({
      name: z.string().describe('The name of the service area.'),
      location: z.string().describe('The address or vicinity of the service area.'),
      services: z.array(z.string()).describe('List of available services (e.g., Gas Station, Restaurant).'),
      distance: z.string().describe('Distance from origin to service area.'),
      mapsUrl: z.string().describe('URL to open location in Google Maps.'),
    })
  ).describe('Array of suggested service areas.'),
});
export type FindServiceAreasOutput = z.infer<typeof FindServiceAreasOutputSchema>;

export async function findServiceAreas(input: FindServiceAreasInput): Promise<FindServiceAreasOutput> {
  return findServiceAreasFlow(input);
}

const findServiceAreasFlow = ai.defineFlow(
  {
    name: 'findServiceAreasFlow',
    inputSchema: FindServiceAreasInputSchema,
    outputSchema: FindServiceAreasOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured. Add GOOGLE_MAPS_API_KEY to your .env file.");
    }

    const client = new Client({});

    try {
      // 1. Get route from Directions API
      const directionsResponse = await client.directions({
        params: {
          origin: input.currentLocation,
          destination: input.destination,
          key: apiKey,
        },
      });

      if (directionsResponse.data.routes.length === 0) {
        return {
          routeSummary: 'No se pudo encontrar una ruta entre los puntos especificados.',
          serviceAreas: [],
        };
      }

      const route = directionsResponse.data.routes[0];
      const overview_polyline = route.overview_polyline.points;
      const decodedPath = decode(overview_polyline);
      const midpointTuple = decodedPath[Math.floor(decodedPath.length / 2)];
      const midpoint = { lat: midpointTuple[0], lng: midpointTuple[1] };

      // 2. Search for service areas near midpoint
      const placesResponse = await client.placesNearby({
        params: {
          location: midpoint,
          radius: 50000, // 50km radius
          type: 'parking', // tipo válido
          keyword: 'rest area, truck stop, área de servicio',
          key: apiKey,
        },
      });

      // 3. Map results and get distance from origin
      const serviceAreaPromises = placesResponse.data.results.map(async (place: Place) => {
        let distanceText = 'N/A';

        const distanceResponse = await client.directions({
          params: {
            origin: input.currentLocation,
            destination: `place_id:${place.place_id}`,
            key: apiKey,
          },
        });

        if (distanceResponse.data.routes.length > 0 && distanceResponse.data.routes[0].legs.length > 0) {
          distanceText = distanceResponse.data.routes[0].legs[0].distance?.text ?? 'N/A';
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          place.name || ''
        )}&query_place_id=${place.place_id}`;

        return {
          name: place.name || 'Sin nombre',
          location: place.vicinity || 'Ubicación no disponible',
          services: place.types || [],
          distance: distanceText,
          mapsUrl: mapsUrl,
        };
      });

      const serviceAreas = await Promise.all(serviceAreaPromises);

      return {
        routeSummary: `Mostrando áreas de servicio en la ruta de ${input.currentLocation} a ${input.destination}.`,
        serviceAreas: serviceAreas.slice(0, 10),
      };
    } catch (e: any) {
      console.error('Error calling Google Maps API:', e.response?.data?.error_message || e.message);
      throw new Error(`Error al llamar a la API de Google Maps: ${e.response?.data?.error_message || e.message}`);
    }
  }
);
