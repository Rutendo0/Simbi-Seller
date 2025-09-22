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
    // Check if user has completed store setup
    if (!profile?.storeName) {
      // Redirect to onboarding if no store information
      window.location.href = '/onboard';
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to store setup...</p>
          </div>
        </div>
      );
    }

    return (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}
