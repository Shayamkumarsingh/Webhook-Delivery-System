import {
  createWebhook,
  getWebhooks,
  deleteWebhook,
} from "../services/webhook.service.js";



export const create =async (req,res,next)=>{
    try{
    const userId = req.headers["x-user-id"];

   const webhook = await createWebhook(userId, req.body);

   res.status(201).json({
    success:true,
    data:webhook,
   });
} catch(err){
    next(err);
}
};


export const getAll=async (req,res,next)=>{
    try{
       const userId = req.headers["x-user-id"];

       const webhooks = await getWebhooks(userId, req.query.eventType);

        res.status(200).json({
            success:true,
            data:webhooks,
        }); 
    } catch(err){
        next(err);
    }
}


export const remove =async (req,res,next)=>{
    try{

         const userId = req.headers["x-user-id"];

        await deleteWebhook(req.params.id,userId);
        res.status(200).json({
            success:true,
            message:"Webhook deleted successfully",
        });
    } catch(err){
        next(err);
    }
}