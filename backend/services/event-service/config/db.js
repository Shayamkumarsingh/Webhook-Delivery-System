import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,  // ← don't buffer if disconnected, fail fast instead
    });

  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

;