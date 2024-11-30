import { NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
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
