// src/models/User.ts

import mongoose, { Document, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  otp?: string; // Optional field to store OTP temporarily
  otpExpires?: Date; // Optional field to store OTP expiration time
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  otp: { type: String }, // Store OTP temporarily
  otpExpires: { type: Date }, // Store expiration time for OTP
});

// Create and export the User model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
