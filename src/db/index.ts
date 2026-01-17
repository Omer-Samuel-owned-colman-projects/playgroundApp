import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/playgroundApp?authSource=admin';

const connectDB = (): void => {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: Error) => console.error('MongoDB connection error:', err));
};

export default connectDB;
