"use client";
import React, { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';


export default function Page() {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('Please check your email and click the verification link.');

  useEffect(()=>{
    if (!auth) {
      setMessage('Firebase authentication is not configured. Please check your environment variables.');
      return;
    }
    setUser(auth.currentUser);
  },[auth]);

  async function resend() {
    if (!auth || !auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email resent.');
    } catch (e) { setMessage('Failed to resend'); }
  }

  async function checkVerified() {
    if (!auth || !auth.currentUser) return;
    setChecking(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // check if user has a store
        const res = await fetch('/api/users?uid=' + encodeURIComponent(auth.currentUser.uid));
        const data = await res.json();
        if (data.user && data.user.store_name) {
          // user has a store, go to dashboard
          window.location.href = '/';
        } else {
          // user needs to create store, go to onboarding
          window.location.href = '/onboard';
        }
        return;
      }
      setMessage('Email not verified yet. Click the link in your email and then click "I have verified".');
    } catch (e) {
      setMessage('Error checking verification');
    }
    setChecking(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">We've sent you a verification link</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify your email address</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={resend}
              variant="outline"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Resend verification email
            </Button>

            <Button
              onClick={checkVerified}
              disabled={checking}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking verification...
                </div>
              ) : (
                'I have verified my email'
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Didn't receive the email?</p>
                <p>Check your spam folder, or try resending the verification email.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-green-600 hover:text-green-500 font-medium">
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
