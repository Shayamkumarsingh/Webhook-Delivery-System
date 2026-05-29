import Event from "../models/event.model.js";
import { publishEvent } from "../producers/kafka.producer.js";




export const createEvent=async (data,userId)=>{
    const event=await Event.create({
        ...data,
        userId,
    });

    await publishEvent(event);

    return event;
}