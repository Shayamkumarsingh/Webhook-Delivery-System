import { logger } from './logger.js';

export const errorHandler=(err, req,res,next)=>{

    logger.error(err.message);

    res.status(err.status || 500).json({
        success:false,
        message:err.message || "Internal Server Error",
    });
};

