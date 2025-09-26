'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { BACKEND_URL } from '../constants/backend';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/loginSA`, {
        email,
        password,
      });
      
      const token = response.data.access_token;
      if (token) {
        const decoded = jwtDecode(token);
        const id = (decoded.sub);
        console.log(id);
      localStorage.setItem('token', token);
      localStorage.setItem('userid', id || '');
      }
      toast.success("Login successful!");
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message;
  
      if (message === "Invalid credentials") {
        toast.error("Incorrect email or password.");
      } else if (message === "Not authorized as Super Admin") {
        toast.error("Access denied. Super Admins only.");
      } else {
        toast.error(message || "An unexpected error occurred.");
      }
    }
  };
  

  return (
    <main className="min-h-screen bg-white p-4 sm:p-6 md:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Header/Logo */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12 2L2 19h20L12 2z" fill="#A8E0D8"/>
              </svg>  
            </div>
            <span className="text-lg sm:text-xl font-medium">Welcome Back</span>
          </div>
        </div>

        {/* Main Content: illustration above form on mobile, side by side on sm+ */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-8 items-center w-full">
          {/* Illustration: above form on mobile, left on desktop */}
          <div className="order-1 sm:order-none w-full flex justify-center">
            <div className="relative aspect-square w-24 xs:w-32 sm:w-40 md:w-64 lg:w-80 xl:w-96 max-w-full flex items-center">
              <div className="absolute inset-0 bg-[#A8E0D8] rounded-3xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-[#FFB6C1] rounded-3xl -rotate-3"></div>
              <div className="absolute inset-0 bg-[#FFD700] rounded-3xl rotate-1"></div>
              <div className="relative h-full w-full bg-white rounded-3xl p-2 xs:p-4 sm:p-8">
                <div className="grid grid-cols-2 gap-1 xs:gap-2 sm:gap-4 h-full">
                  <div className="space-y-1 xs:space-y-2 sm:space-y-4">
                    <div className="bg-[#FFB6C1] h-1/3 rounded-xl"></div>
                    <div className="bg-[#A8E0D8] h-2/3 rounded-xl"></div>
                  </div>
                  <div className="space-y-1 xs:space-y-2 sm:space-y-4">
                    <div className="bg-[#FFD700] h-2/3 rounded-xl"></div>
                    <div className="bg-gray-100 h-1/3 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Heading and form */}
          <div className="order-2 sm:order-none min-w-0 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-6xl md:text-7xl font-bold leading-tight">
              Login to
              <br />
              Your Admin
              <br />
              Panel
            </h1>
            <form onSubmit={handleLogin} className="space-y-6 max-w-md mt-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none transition-all text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#A8E0D8] focus:border-transparent outline-none transition-all text-base"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  type="submit" 
                  className="w-full px-6 py-3 bg-[#A8E0D8] text-black rounded-full hover:bg-opacity-90 transition-all font-medium"
                >
                  Login to Dashboard
                </button>
                <button 
                  type="button" 
                  className="w-full px-6 py-3 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 