import { createConsumer,TOPICS,logger } from "shared";
import { saveToDLQ } from "../services/dlq.service";

export const startDLQConsumer=async ()=>{
    await createConsumer("dlq-group",TOPICS.DLQ,async (message)=>{
       try{
        logger.error("Recieved failed event , storing in DLQ");

        await saveToDLQ({
            ...message,
            reason:"Max retries exceeded",
        });
    } catch(err){
        logger.error("Error processing DLQ message:", err);
    }
       } );
};