import { createConsumer , TOPICS ,logger } from "shared";
import { notifyFailure } from "../services/notification.service";

export const startNotificationConsumer=async ()=>{
    await createConsumer("notification-group",TOPICS.DLQ,async (message)=>{
        try{
            logger.info("Received DLQ event , sending notification");

            await notifyFailure(message);
        } catch(err){
            logger.error("Notification consumer failed",err);
        }
        });
}