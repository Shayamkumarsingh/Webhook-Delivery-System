export const verifyUser = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  req.user = { id: userId };
  next();
};