import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  res.headers.append(
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Origin'
  ); // Only allow this origin
  res.headers.append(
    'Access-Control-Allow-Methods',
    'GET, DELETE, PATCH, POST, PUT'
  );

  return res;
}

export const config = {
  matcher: ['/app/api/:path*'],
};
