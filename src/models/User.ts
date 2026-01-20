import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);
