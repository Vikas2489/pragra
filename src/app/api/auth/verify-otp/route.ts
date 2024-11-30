import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Manually implement CORS
const setCorsHeaders = (res: NextResponse) => {
  res.headers.set(
    'Access-Control-Allow-Origin',
    'https://pragra-phi.vercel.app/'
  ); // Allow any origin
  res.headers.set('Access-Control-Allow-Methods', 'POST, GET, HEAD');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
};

// Handle OPTIONS request for preflight CORS checks
const handleOptions = (): NextResponse => {
  const res = new NextResponse(null, { status: 204 }); // No content
  setCorsHeaders(res);
  return res;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Handle OPTIONS (CORS pre-flight check)
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  // Handle the actual POST request
  const res = new NextResponse();

  // Set CORS headers
  setCorsHeaders(res);

  // Extract email and OTP from the request body
  const { email, otp } = await req.json();

  // Connect to the database
  await dbConnect();

  // Check if user exists and validate OTP
  const user = await User.findOne({ email });

  if (
    !user ||
    !user.otp ||
    !user.otpExpires ||
    user.otp !== otp ||
    user.otpExpires < new Date()
  ) {
    return new NextResponse(
      JSON.stringify({ message: 'Invalid or expired OTP.' }),
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
    { expiresIn: '1h' } // 1 hour expiry
  );

  // Return the token
  return new NextResponse(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
