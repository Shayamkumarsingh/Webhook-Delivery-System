export const validate=(schema)=>(req,res,next)=>{
    try{
        schema.parse(req.body);
        next(); 
    }catch(err){
        res.status(400).json({
            success:false,
            message:err.errors,
        });
    }
};