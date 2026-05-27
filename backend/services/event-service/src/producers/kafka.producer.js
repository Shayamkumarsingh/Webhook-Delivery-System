import { connectProducer, sendMessage, TOPICS } from "shared";

export const publishEvent=async (event)=>{
    try{
        await connectProducer();
        await sendMessage(TOPICS.EVENTS,event);
    }catch(err){
        console.error(" Publish Event Error:",err);
    }
}