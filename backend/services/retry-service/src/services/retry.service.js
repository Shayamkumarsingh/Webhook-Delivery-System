import { sendMessage, TOPICS, logger } from "shared";
import { getBackoffTime } from "../utils/backoff.js";
import { retryQueue } from "../queue/retry.queue.js";


import { metricsMiddleware } from "shared/middleware/metrics.middleware.js";
import { register } from "shared/utils/metrics.js";

app.use(metricsMiddleware);

//  Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});



export const processRetry=async ({event,webhook,attempt=1})=>{
    const delay=getBackoffTime(attempt);

    // max retries exceeded then send to DLQ

    if(!delay){
        logger.error(`Max retry attempts exceeded for event ${event._id} and webhook ${webhook._id}`);
        await sendMessage(TOPICS.DLQ,{event,webhook,attempt});
        return;
    }

    logger.info(`Scheduling retry ${attempt} for event ${event._id} and webhook ${webhook._id} after ${delay/1000} seconds`);

    // Schedule retry by sending message to retry topic with delay info

    // ✅ Add delayed job to BullMQ
  await retryQueue.add(
    "retry-job",
    { event, webhook, attempt },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );


}