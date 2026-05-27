import {  sendMessage } from "../../../../shared/kafka/producer.js";
import {  TOPICS } from "../../../../shared/kafka/topics.js";

import { connectProducer } from "../../../../shared/kafka/producer.js";

await connectProducer();

export const handleRetry = async ({event,webhook,attempt})=>{
    if(attempt>=3){
        await sendMessage(TOPICS.DLQ,{
            event,
            webhook,
    }
        );
        return;
    }

    await sendMessage(TOPICS.RETRY,{
        event,
        webhook,
        attempt:attempt+1,
    });
}