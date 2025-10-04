import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-route-breaks.ts';
import '@/ai/flows/calculate-pause-time.ts';
import '@/ai/flows/calculate-route-details.ts';
