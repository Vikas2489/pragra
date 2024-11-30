import { NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();

  await dbConnect();

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = expires;

  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  });

  return NextResponse.json({ message: 'OTP sent to your email.' });
}
