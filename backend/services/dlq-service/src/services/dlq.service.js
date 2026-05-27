import DLQEvent from "../models/dlq.model";
import { sendMessage,TOPICS,logger } from "shared";


import { metricsMiddleware } from "shared/middleware/metrics.middleware.js";
import { register } from "shared/utils/metrics.js";

app.use(metricsMiddleware);

//  Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});



export const saveToDLQ=async (data) => {
    return await DLQEvent.create(data);
}

export const getAllDLQ=async ()=>{
    return await DLQEvent.find().sort({ createdAt: -1 });
}

export const retryFromDLQ=async (id)=>{
    const item =await DLQEvent.findById(id);
    if(!item){
        throw new Error("DLQ item not found");
    };

    logger.info(`Retrying DLQ item ${id} with event ${item.eventType}`);

    await sendMessage(TOPICS.EVENTS, {
        ...item.event,
        retryAttempt:1,
    });
    return { success:true};
};

export const deleteDLQ=async (id)=>{
    return await DLQEvent.findByIdAndDelete(id);
};