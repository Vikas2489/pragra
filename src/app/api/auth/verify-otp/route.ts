// src/app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const cors: any = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: ['*'],
});

function runMiddleware(
  req: Request,
  res: Response,
  fn: (req: Request, res: Response, next: (result?: any) => void) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function POST(req: Request) {
  await runMiddleware(req, NextResponse.next(), cors);
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
