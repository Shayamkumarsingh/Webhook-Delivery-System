import { registerUser,loginUser,getUserByApiKey,refreshAccessToken,logoutUser , getUserByIdService  } from "../services/auth.service.js";

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

        res.status(200).json({
            success:true,
            ...data,
        });
    }catch(err){
        next(err);
    }
};


export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw { status: 400, message: "Refresh token required" };
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
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