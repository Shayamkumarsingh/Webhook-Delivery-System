import { createConsumer } from "../../../../shared/kafka/consumer.js";
import {  TOPICS } from "../../../../shared/kafka/topics.js";
import { deliveryEvent } from "../services/delivery.service.js";
import axios from "axios";

const getWebhooks = async (eventType, userId) => {
  try {
    const res = await axios.get(
      `${process.env.WEBHOOK_SERVICE_URL}/api/webhooks?eventType=${eventType}`,
      {
        headers: {
          "x-user-id": userId,
        },
      }
    );

    return res.data.data;

  } catch (err) {
    console.error("Failed to fetch webhooks:", err.message);
    return [];
  }
};

export const startConsumer=async()=>{
  
    await createConsumer("delivery-group",TOPICS.EVENTS,async(event)=>{
        try{
        const webhooks=await getWebhooks(event.eventType,event.userId);

        for(const webhook of webhooks){
            await deliveryEvent(event,webhook);
        }
   
} catch(err){
    console.error("Consumer processing error:", err.message);
}
});
}