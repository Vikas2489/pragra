import { NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  await dbConnect();

  const user = await User.findOne({ email });

  if (
    !user ||
    !user.otp ||
    !user.otpExpires ||
    user.otp !== otp ||
    user.otpExpires < new Date()
  ) {
    return NextResponse.json(
      { message: 'Invalid or expired OTP.' },
      { status: 400 }
    );
  }
  // Clear the OTP after successful verification
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  return NextResponse.json({ token });
}
