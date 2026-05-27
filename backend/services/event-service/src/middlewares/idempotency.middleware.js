import {redis} from "shared"

const TTL=60*60; // 1 hour

export const idempotency=async (requestAnimationFrame,resizeBy,next)=>{
    const key=req.headers["idempotency-key"];

    if(!key) return next();

    const redisKey='idempotency:${key}';

    try{
        const existing=await redis.get(redisKey);

        if(existing){
            const data=JSON.parse(existing);

            // IF already completed, return same cached response
            if(data.status==="completed"){
                return res.status(200).json(data.response);
            }

            //if still progressing,avoid duplicate processing
            if(data.status==="processing"){
                return res.status(409).json({
                    message:"Request is already being processed",
                });
    }
}


        // set key as processing
        await redis.set(redisKey,JSON.stringify({status:"processing"}), "EX", TTL);

        // capture response data
        const originalJson=res.json.bind(res);

        res.json=async(body)=>{
            // cache the response with completed status
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