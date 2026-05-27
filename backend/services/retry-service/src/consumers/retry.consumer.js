import { createConsumer, TOPICS, logger } from "shared";
import { processRetry } from "../services/retry.service.js";

export const startRetryConsumer = async () => {
    await createConsumer("retry-group",TOPICS.RETRY, async (message) => {
        try {

            const { event, webhook, attempt =1 } = message;

           logger.info(`Received retry event (attempt ${attempt})`);

            await processRetry({ event, webhook, attempt });
        } catch (err) {
            logger.error("Error processing retry event:", err);
        }
    });
}