'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Simulate logout API call
    const handleLogout = async () => {
      try {
        // Replace with actual logout API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/'); // Redirect to login page
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-xs sm:max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-12">
          <div className="w-10 h-10 sm:w-12 sm:h-12">
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#A8E0D8]">
              <path d="M12 2L2 19h20L12 2z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Logout Card */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-[#A8E0D8] rounded-full flex items-center justify-center mb-2 sm:mb-4">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold">Logging Out</h1>
          
          <p className="text-gray-600 text-sm sm:text-base">
            You are being securely logged out of your account.
          </p>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mt-4 sm:mt-6">
            <div 
              className="bg-[#A8E0D8] h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500">
            Redirecting to login page in {countdown} seconds...
          </p>

          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 sm:px-6 py-3 bg-[#A8E0D8] text-black rounded-full hover:bg-opacity-90 transition-all w-full font-medium"
            >
              Return to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Thank you for using our admin panel
          </p>
        </div>
      </div>
    </div>
  );
}