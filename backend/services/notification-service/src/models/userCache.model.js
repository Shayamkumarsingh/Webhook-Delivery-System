import mongoose from "mongoose";

const userCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    email: String,
  },
  { timestamps: true }
);

export default mongoose.model("UserCache", userCacheSchema);