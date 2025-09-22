import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto h-full flex items-center">
          <div className="relative z-10 w-full bg-transparent">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Sell your auto parts</span>
                  <span className="block text-green-600">on our marketplace</span>
                </h1>
                <p className="mt-6 text-lg text-gray-500 sm:text-xl sm:max-w-2xl sm:mx-auto">
                  Join thousands of sellers who trust Carspian Seller to reach more customers and grow their business. Start selling today with our easy-to-use platform.
                </p>
                <div className="mt-8 flex justify-center space-x-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium">
                      Start Selling Today
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="px-8 py-3 text-base font-medium">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="hidden lg:block absolute top-8 left-8">
          <div className="flex items-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-gray-900">Carspian Seller</h2>
              <p className="text-sm text-gray-600">Auto Parts Marketplace</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;