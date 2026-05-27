import mongoose from "mongoose" 

const eventSchema=new mongoose.Schema({
    userId:String,
    eventType:String,
    payload:Object,
    status:{
        type:String,
        default:"pending"}
 },{timestamps:true});

 const Event=mongoose.model("Event",eventSchema);

 export default Event;