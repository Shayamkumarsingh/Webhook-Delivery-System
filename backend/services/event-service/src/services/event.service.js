import Event from "../models/event.model.js";
import { publishEvent } from "../producers/kafka.producer.js";


import { metricsMiddleware } from "shared/middleware/metrics.middleware.js";
import { register } from "shared/utils/metrics.js";

app.use(metricsMiddleware);

//  Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});



export const createEvent=async (data,userId)=>{
    const event=await Event.create({
        ...data,
        userId,
    });

    await publishEvent(event);

    return event;
}