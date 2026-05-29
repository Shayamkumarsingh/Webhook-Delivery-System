import mongoose from "mongoose" 

const eventSchema=new mongoose.Schema({
    userId: { type: String, required: true },
  email:  { type: String, required: true },
  eventType: { type: String, required: true }, // e.g. "user.created"
  payload: { type: Object, default: {} },
    status: {
  type: String,
  enum: ["pending", "published", "failed"],
  default: "pending"
}
 },{timestamps:true});

 const Event=mongoose.model("Event",eventSchema);

 export default Event;