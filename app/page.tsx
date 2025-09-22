"use client";
import React from 'react';
import LandingPage from "@/components/LandingPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dashboard } from "@/components/Dashboard";
import { useUser } from "@/hooks/useUser";
import { getFirebaseAuth } from "@/lib/firebaseClient";

export default function Page() {
  const { user, profile, loading } = useUser();

  // Check Firebase auth state directly
  const auth = getFirebaseAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard or redirect to onboarding
  if (user) {
    // Wait for profile to be fully loaded before checking store setup
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    // Check if user has completed store setup
    if (!profile?.storeName) {
      // Check if we're coming from onboarding (to prevent redirect loop)
      const fromOnboard = typeof window !== 'undefined' && sessionStorage.getItem('fromOnboard');

      if (fromOnboard) {
        console.log('Dashboard - Coming from onboarding, allowing time for profile to load');
        sessionStorage.removeItem('fromOnboard');

        // Give more time for profile to load from database
        setTimeout(() => {
          if (!profile?.storeName) {
            console.log('Dashboard - Still no store name after delay, redirecting to onboarding');
            window.location.href = '/onboard';
          }
        }, 2000); // 2 second delay

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your dashboard...</p>
            </div>
          </div>
        );
      } else if (typeof window !== 'undefined' && window.location.pathname !== '/onboard') {
        // Not coming from onboarding and not already on onboarding page
        console.log('Dashboard - No store name found, redirecting to onboarding');
        window.location.href = '/onboard';
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to store setup...</p>
            </div>
          </div>
        );
      } else {
        // Already on onboarding page, don't redirect
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading onboarding...</p>
            </div>
          </div>
        );
      }
    }

    return (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}
