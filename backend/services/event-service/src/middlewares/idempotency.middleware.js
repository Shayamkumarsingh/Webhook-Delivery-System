import { redis } from "../../../../shared/utils/redis.js";

const TTL=60*60; 

export const idempotency = async (req, res, next) => {
    const key=req.headers["idempotency-key"];

    if(!key) return next();

    const redisKey = `idempotency:${key}`;

    try{
        const existing=await redis.get(redisKey);

        if(existing){
            const data=JSON.parse(existing);

            
            if(data.status==="completed"){
                return res.status(200).json(data.response);
            }


            if(data.status==="processing"){
                return res.status(409).json({
                    message:"Request is already being processed",
                });
    }
}


       
        await redis.set(redisKey,JSON.stringify({status:"processing"}), "EX", TTL);

      
        const originalJson=res.json.bind(res);

        res.json=async(body)=>{
            await redis.set(redisKey,JSON.stringify({
                status:"completed",
                response:body,
            }), "EX", TTL);
            return originalJson(body);
        }
        next();
    } catch(err){
        console.error("Idempotency middleware error:",err);
        next();
    }
};