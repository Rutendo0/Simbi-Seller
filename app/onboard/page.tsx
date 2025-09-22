"use client";
import React, { useEffect, useState } from 'react';
import { getFirebaseAuth, syncUserWithDatabase } from '@/lib/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

// Client-side only component - no server-side logic


export default function Page() {
  const auth = getFirebaseAuth();
  const { updateProfile } = useUser();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('Onboard page - Auth state:', {
      auth: !!auth,
      currentUser: !!auth?.currentUser,
      userEmail: auth?.currentUser?.email,
      fromLogin: sessionStorage.getItem('fromLogin')
    });

    if (!auth) {
      console.log('Onboard page - No auth object, waiting...');
      return;
    }

    // Prevent redirect loop by checking if we're coming from login
    const fromLogin = sessionStorage.getItem('fromLogin');
    if (fromLogin) {
      console.log('Onboard page - From login, removing flag and staying');
      sessionStorage.removeItem('fromLogin');
      setAuthChecked(true);
      return; // Don't redirect back to login
    }

    // Add a small delay to allow Firebase Auth to initialize
    setTimeout(() => {
      console.log('Onboard page - Checking auth after delay:', {
        auth: !!auth,
        currentUser: !!auth?.currentUser,
        userEmail: auth?.currentUser?.email
      });

      if (!auth.currentUser) {
        console.log('Onboard page - No current user, redirecting to login');
        window.location.href = '/login';
      } else {
        console.log('Onboard page - User authenticated, staying on onboard');
        setAuthChecked(true);
      }
    }, 1000); // 1 second delay
  }, [auth]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    console.log('Onboard submit - Auth state:', {
      auth: !!auth,
      currentUser: !!auth?.currentUser,
      userEmail: auth?.currentUser?.email
    });

    if (!auth || !auth.currentUser) {
      console.log('Onboard submit - No auth or current user');
      return;
    }

    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      console.log('Onboard submit - Creating store for user:', uid);

      // First ensure user exists in database
      try {
        await syncUserWithDatabase(auth.currentUser);
        console.log('✅ User synchronized with database before store creation');
      } catch (syncError) {
        console.error('❌ Failed to sync user before store creation:', syncError);
        // Continue anyway - the sync might have worked partially
      }

      // Save store profile to database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email: auth.currentUser.email,
          displayName: `${firstName} ${lastName}`,
          storeName,
          phoneNumber,
          nationalId,
          vatNumber,
          storeCountry: country,
          storeCity: city,
          storeAddress1: address,
          businessOwnerName: `${firstName} ${lastName}`,
          businessOwnerEmail: auth.currentUser.email,
          businessOwnerPhone: phoneNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save store profile');
      }

      const result = await response.json();
      console.log('✅ Store profile saved successfully:', result);

      // Save to user profile context
      await updateProfile({
        displayName: `${firstName} ${lastName}`,
        phoneNumber,
        nationalId,
        storeName,
        vatNumber,
        storeCountry: country,
        storeCity: city,
        storeAddress1: address,
        businessOwnerName: `${firstName} ${lastName}`,
        businessOwnerEmail: auth.currentUser.email || undefined,
        businessOwnerPhone: phoneNumber
      });

      console.log('Onboard submit - Store created and profile saved, redirecting to dashboard');
      toast({
        title: "Store Created Successfully!",
        description: "Welcome to your new store dashboard. You can now start managing your business.",
        variant: "default",
      });

      // Set a flag to indicate we're coming from onboarding to prevent redirect loop
      sessionStorage.setItem('fromOnboard', 'true');

      // go to dashboard with a longer delay to ensure profile is saved
      setTimeout(() => {
        console.log('Onboard submit - Redirecting to dashboard after delay');
        window.location.href = '/';
      }, 2000); // Longer delay to ensure profile is fully saved
    } catch (e) {
      console.error('Onboard submit - Failed to save:', e);
      toast({
        title: "Setup Failed",
        description: "Failed to create your store. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  if (!authChecked) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold mb-2">Checking authentication...</h1>
          <p className="text-gray-600">Please wait while we verify your login status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your store</h1>
          <p className="text-gray-600">Set up your business information to get started</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={submit} className="space-y-6">
            {/* Business Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Owner Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e)=>setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID / Business Registration Number
                </label>
                <Input
                  value={nationalId}
                  onChange={(e)=>setNationalId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter national ID or business registration number"
                  required
                />
              </div>
            </div>

            {/* Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Store Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <Input
                  value={storeName}
                  onChange={(e)=>setStoreName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your store name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT / Tax Number
                </label>
                <Input
                  value={vatNumber}
                  onChange={(e)=>setVatNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter VAT or tax number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <Input
                  value={address}
                  onChange={(e)=>setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter business address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e)=>setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={country}
                    onChange={(e)=>setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating store...
                </div>
              ) : (
                'Create Store'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
