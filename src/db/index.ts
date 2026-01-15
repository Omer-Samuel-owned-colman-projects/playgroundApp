import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/playgroundApp?authSource=admin';

const connectDB = (): void => {
  mongoose.connect(MONGO_URI)
    .then(() => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Connected to MongoDB');
      }
    })
    .catch((err: Error) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('MongoDB connection error:', err)
      }
    });
};

export default connectDB;
