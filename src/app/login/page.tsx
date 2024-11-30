'use client';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function validateEmail(emailId: string) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(emailId)) {
      return false;
    }

    return true;
  }

  const sendOtp = async () => {
    const url = 'https://pragra-i32a.vercel.app/api/auth/send-otp';
    // const url = 'http://localhost:3000/api/auth/send-otp';
    const data = { email };

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url, {
        method: 'POST', // Specify the request method
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify(data), // Convert data to JSON string
      });

      if (response.ok) {
        setIsOtpSent(() => true);
      } else {
        // Handle unexpected response
        setError('Failed to send OTP. Please try again.');
      }

      setLoading(() => false);
    } catch (error) {
      setLoading(() => false);
      console.error('Error sending OTP:', error); // Handle errors during the request
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) {
      setError('Invalid OTP. Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://pragra-i32a.vercel.app/api/auth/verify-otp',
        // 'http://localhost:3000',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (!response.ok) {
        return setError('Failed to verify OTP');
      }

      const { token } = await response.json();
      localStorage.setItem('userToken', token);
      window.location.href = '/product';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if userToken exists in localStorage
    if (typeof window !== 'undefined') {
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        router.push('/product');
      }
    }
  }, [router]);

  return (
    <>
      <Header />
      <div className="flex items-center justify-center sm:mx-0 sm:my-auto min-h-screen">
        <div className="bg-white shadow-xl rounded-lg p-8 sm:p-3 sm:w-[85%] w-full max-w-md transform transition-all duration-300 hover:scale-105">
          <h2 className="text-[1.4rem] text-center sm:text-[1.1rem] font-semibold mb-[0.59rem] text-[#3f0e9e]">
            Log In or Create Account Using OTP
          </h2>

          {error && (
            <div className="text-red-600 bg-red-100 p-3 mb-4 rounded-md text-center">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isOtpSent}
            />
          </div>

          {isOtpSent && (
            <div className="mb-5">
              <label className="block text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
          )}

          <button
            className={`w-full py-3 sm:font-normal sm:py-2 text-white font-bold rounded-md shadow-lg transform transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-violet-700 hover:bg-violet-700 hover:scale-105'
            }`}
            onClick={isOtpSent ? handleLogin : sendOtp}
            disabled={loading}
          >
            {loading ? 'Processing...' : isOtpSent ? 'Login' : 'Send OTP'}
          </button>

          {isOtpSent && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Didn’t receive an OTP?{' '}
              <button
                onClick={sendOtp}
                className="text-violet-700 hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
