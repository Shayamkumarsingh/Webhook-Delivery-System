import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info',
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Log = mongoose.model("Log", logSchema);

export default Log;
