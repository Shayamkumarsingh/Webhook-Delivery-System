import {z} from "zod" ;

export const eventSchema = z.object({
  eventType: z.string(),
  email: z.string().email(),        
  payload: z.object({}).passthrough().optional(),
});