import mongoose  from "mongoose";
const DLQSchema = new mongoose.Schema({
    event:Object,
    webhook:Object,
    reason:String,
    attempts:Number,
},{timestamps:true}
);

const DLQEvent = mongoose.model("DLQEvent",DLQSchema);

export default DLQEvent;