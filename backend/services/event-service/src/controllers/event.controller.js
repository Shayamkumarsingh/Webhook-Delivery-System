import { createEvent } from "../services/event.service.js";


export const create=async (req,res,next)=>{
    try{
         const userId = req.headers["x-user-id"];

         const event = await createEvent(req.body, userId);
        res.status(201).json({
            success:true,
            data:event,
        });
    } catch(err){
        next(err);
    }
}