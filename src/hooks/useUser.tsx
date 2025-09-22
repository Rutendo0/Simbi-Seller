"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth, syncUserWithDatabase } from '@/lib/firebaseClient';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  storeName?: string;
  phoneNumber?: string;
  nationalId?: string;
  businessOwnerName?: string;
  businessOwnerEmail?: string;
  businessOwnerPhone?: string;
  storeCountry?: string;
  storeCity?: string;
  storeAddress1?: string;
  storeAddress2?: string;
  postalCode?: string;
  vatNumber?: string;
}

interface UserContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      console.error('Firebase auth not available');
      setLoading(false);
      return;
    }

    // Set loading to true initially
    setLoading(true);
    setUser(null);
    setProfile(null);

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // First, ensure user exists in database
          await syncUserWithDatabase(firebaseUser);

          // Check if we're coming from onboarding - if so, add extra delay for database sync
          const fromOnboard = typeof window !== 'undefined' && sessionStorage.getItem('fromOnboard');
          if (fromOnboard) {
            console.log('useUser - Coming from onboarding, adding extra delay for database sync');
            sessionStorage.removeItem('fromOnboard');
            // Add extra delay to allow database to sync
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Try to load profile from API/database
          const response = await fetch(`/api/users?uid=${firebaseUser.uid}`);
          const data = await response.json();

          if (response.ok && data.user) {
            // Profile found in database
            const profileFromDb: UserProfile = {
              uid: data.user.uid,
              email: data.user.email,
              displayName: data.user.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              storeName: data.user.storeName,
              phoneNumber: data.user.phoneNumber,
              nationalId: data.user.nationalId,
              businessOwnerName: data.user.businessOwnerName,
              businessOwnerEmail: data.user.businessOwnerEmail,
              businessOwnerPhone: data.user.businessOwnerPhone,
              storeCountry: data.user.storeCountry,
              storeCity: data.user.storeCity,
              storeAddress1: data.user.storeAddress1,
              storeAddress2: data.user.storeAddress2,
              postalCode: data.user.postalCode,
              vatNumber: data.user.vatNumber,
            };

            setProfile(profileFromDb);
            // Also save to localStorage for immediate access
            localStorage.setItem(`user_profile_${firebaseUser.uid}`, JSON.stringify(profileFromDb));
            console.log('✅ Profile loaded from database:', firebaseUser.uid, profileFromDb.storeName ? '(with store)' : '(no store)');
          } else {
            // No profile in database, create from Firebase user
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            };

            setProfile(defaultProfile);
            // Save to localStorage for immediate access
            localStorage.setItem(`user_profile_${firebaseUser.uid}`, JSON.stringify(defaultProfile));
            console.log('ℹ️ No database profile found, using Firebase data:', firebaseUser.uid);
          }
        } catch (error) {
          console.error('❌ Error loading profile from API:', error);

          // Fallback to localStorage
          const savedProfile = localStorage.getItem(`user_profile_${firebaseUser.uid}`);
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              setProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
                ...parsedProfile
              });
              console.log('✅ Profile loaded from localStorage fallback:', firebaseUser.uid);
            } catch (parseError) {
              console.error('❌ Error parsing localStorage profile:', parseError);
              // Create default profile
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
              };
              setProfile(defaultProfile);
            }
          } else {
            // Create default profile
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            };
            setProfile(defaultProfile);
          }
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(updatedProfile));

    try {
      // Sync to database via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: updatedProfile.displayName,
          storeName: updatedProfile.storeName,
          phoneNumber: updatedProfile.phoneNumber,
          nationalId: updatedProfile.nationalId,
          businessOwnerName: updatedProfile.businessOwnerName,
          businessOwnerEmail: updatedProfile.businessOwnerEmail,
          businessOwnerPhone: updatedProfile.businessOwnerPhone,
          storeCountry: updatedProfile.storeCountry,
          storeCity: updatedProfile.storeCity,
          storeAddress1: updatedProfile.storeAddress1,
          storeAddress2: updatedProfile.storeAddress2,
          postalCode: updatedProfile.postalCode,
          vatNumber: updatedProfile.vatNumber,
        }),
      });

      if (response.ok) {
        console.log('✅ Profile updated in database:', user.uid);
      } else {
        console.error('❌ Failed to update profile in database:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error updating profile in database:', error);
      // Continue with localStorage fallback
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      // Fetch fresh profile from API/database
      const response = await fetch(`/api/users?uid=${user.uid}`);
      const data = await response.json();

      if (response.ok && data.user) {
        const refreshedProfile: UserProfile = {
          uid: data.user.uid,
          email: data.user.email,
          displayName: data.user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          storeName: data.user.storeName,
          phoneNumber: data.user.phoneNumber,
          nationalId: data.user.nationalId,
          businessOwnerName: data.user.businessOwnerName,
          businessOwnerEmail: data.user.businessOwnerEmail,
          businessOwnerPhone: data.user.businessOwnerPhone,
          storeCountry: data.user.storeCountry,
          storeCity: data.user.storeCity,
          storeAddress1: data.user.storeAddress1,
          storeAddress2: data.user.storeAddress2,
          postalCode: data.user.postalCode,
          vatNumber: data.user.vatNumber,
        };

        setProfile(refreshedProfile);
        localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(refreshedProfile));
        console.log('✅ Profile refreshed from database:', user.uid);
      } else {
        console.log('ℹ️ No fresh profile data available from database');
      }
    } catch (error) {
      console.error('❌ Error refreshing profile from database:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, updateProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}