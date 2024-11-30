import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Manually implement CORS
const setCorsHeaders = (res: NextResponse) => {
  res.headers.set(
    'Access-Control-Allow-Origin',
    'https://pragra-phi.vercel.app/'
  );
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  res.headers.set('Access-Control-Max-Age', '86400');
};

const handleOptions = (): NextResponse => {
  const res = new NextResponse(null, { status: 204 });
  setCorsHeaders(res);
  return res;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  const res = new NextResponse(null, { status: 200 });

  setCorsHeaders(res);

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

  return new NextResponse(
    JSON.stringify({ message: 'OTP sent to your email.' }),
    {
      status: 200, // Status code
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://pragra-phi.vercel.app/',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
