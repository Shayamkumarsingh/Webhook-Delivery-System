import {z} from "zod" ;

export const eventSchema=z.object({
    eventType:z.string(),
    payload:z.object({}).passthrough(),
});