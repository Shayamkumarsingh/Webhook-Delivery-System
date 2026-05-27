import {z} from "zod";


export const createWebhookSchema = z.object({
    url:z.string().url(),
    eventType:z.string().min(3, "Event type is required"),
});