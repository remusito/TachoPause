
'use server';

/**
 * @fileOverview A service area finder for routes using Google Maps API.
 *
 * - findServiceAreas - A function that finds service areas along a route.
 * - FindServiceAreasInput - The input type for the findServiceareas function.
 * - FindServiceAreasOutput - The return type for the findServiceAreas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {Client, Place, PlaceType2} from '@googlemaps/google-maps-services-js';
import {decode} from '@googlemaps/polyline-codec';

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
      distance: z.string().describe("The distance to the service area from the origin."),
      mapsUrl: z.string().describe("The URL to open the location in Google Maps."),
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
      throw new Error("Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your .env file.");
    }

    const client = new Client({});

    try {
      // 1. Get the route from directions API
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

      // For simplicity, we'll search near the midpoint of the route.
      // A more complex implementation could search at multiple points.
      const decodedPath = decode(overview_polyline);
      const midpointTuple = decodedPath[Math.floor(decodedPath.length / 2)];
      const midpoint = {lat: midpointTuple[0], lng: midpointTuple[1]};

      // 2. Search for service areas (rest_area) and gas stations near the midpoint
      const placesResponse = await client.placesNearby({
        params: {
          location: midpoint,
          radius: 50000, // Search within a 50km radius of the midpoint
          type: 'rest_area' as PlaceType2,
          keyword: 'truck stop, area de servicio',
          key: apiKey,
        },
      });

      const serviceAreaPromises = placesResponse.data.results.map(async (place: Place) => {
        let distanceText = 'N/A';
        // 3. For each place, get distance from origin
        const distanceResponse = await client.directions({
            params: {
                origin: input.currentLocation,
                destination: `place_id:${place.place_id}`,
                key: apiKey,
            }
        });

        if (distanceResponse.data.routes.length > 0 && distanceResponse.data.routes[0].legs.length > 0) {
            distanceText = distanceResponse.data.routes[0].legs[0].distance?.text ?? 'N/A';
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}&query_place_id=${place.place_id}`;

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
        serviceAreas: serviceAreas.slice(0, 10), // Limit to 10 results
      };
    } catch (e: any) {
      console.error('Error calling Google Maps API:', e.response?.data?.error_message || e.message);
      throw new Error(`Error al llamar a la API de Google Maps: ${e.response?.data?.error_message || e.message}`);
    }
  }
);
