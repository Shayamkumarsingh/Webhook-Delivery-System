import { registerUser,loginUser,getUserByApiKey, getUserByIdService  } from "../services/auth.service.js";

export const register= async(req,res,next)=>{
    try{
    const user=await registerUser(req.body);

    res.status(201).json({
        success:true,
        data:user,
    });
}catch(err){
    next(err);
}
};

export const login=async (req,res,next)=>{
    try{
        const data=await loginUser(req.body);

        res.json({
            success:true,
            ...data,
        });
    }catch(err){
        next(err);
    }
};

export const getMe = async (req, res) => {
    res.json({
        success: true,
        data: req.user,  // already fetched by verifyApiKey
    });
}


export const getUserById = async (req, res) => {
  try {
    // 🔐 internal security check
    if (req.headers["x-internal-secret"] !== process.env.INTERNAL_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await getUserByIdService(req.params.id);

    res.json({
      success: true,
      data: user,
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};