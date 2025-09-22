import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;

// Production-ready environment variable getter
function getEnvVar(name: string): string | undefined {
  // Try window.__env first (client-side)
  if (typeof window !== 'undefined') {
    const value = (window as any).__env?.[name];
    if (value) return value;
  }

  // Fallback to process.env (server-side only)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }

  return undefined;
}

export function initFirebase() {
  if (typeof window === 'undefined') {
    console.log('Firebase init skipped - server-side rendering');
    return null;
  }

  if (getApps().length > 0) {
    console.log('Firebase app already initialized');
    return getApps()[0];
  }

  // Get required environment variables (try VITE_ prefix first, then NEXT_PUBLIC_ for compatibility)
  const apiKey = getEnvVar('VITE_FIREBASE_API_KEY') || getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY');
  const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  const projectId = getEnvVar('VITE_FIREBASE_PROJECT_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const appId = getEnvVar('VITE_FIREBASE_APP_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID');

  console.log('Firebase config check:', {
    apiKey: apiKey ? 'present' : 'missing',
    authDomain: authDomain ? 'present' : 'missing',
    projectId: projectId ? 'present' : 'missing',
    appId: appId ? 'present' : 'missing'
  });

  // Check for missing required variables
  if (!apiKey || !authDomain || !projectId || !appId) {
    console.error('Missing required Firebase environment variables:', {
      apiKey: !!apiKey,
      authDomain: !!authDomain,
      projectId: !!projectId,
      appId: !!appId
    });
    return null;
  }

  const cfg = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: appId,
  } as any;

  try {
    console.log('Initializing Firebase with config:', {
      apiKey: cfg.apiKey.substring(0, 10) + '...',
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      appId: cfg.appId.substring(0, 10) + '...'
    });
    firebaseApp = initializeApp(cfg);
    console.log('Firebase initialized successfully');
    return firebaseApp;
  } catch (e) {
    console.error('Failed to initialize Firebase:', e);
    return null;
  }
}

export function getFirebaseAuth() {
  const app = initFirebase();
  if (!app) {
    console.log('Firebase app initialization failed, creating development mode auth');

    // For development mode without Firebase, create a mock auth object
    // This will allow the app to function without Firebase
    const mockAuth = {
      currentUser: null,
      onAuthStateChanged: (callback: (user: any) => void) => {
        console.log('Mock auth: onAuthStateChanged called');
        // Simulate no user logged in
        setTimeout(() => callback(null), 100);
        return () => {}; // Mock unsubscribe function
      },
      signOut: async () => {
        console.log('Mock auth: signOut called');
        return Promise.resolve();
      }
    } as any;

    return mockAuth;
  }
  try {
    const auth = getAuth(app);

    // Set up auth persistence to maintain login state
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('Firebase auth persistence set to local');
        })
        .catch((error) => {
          console.error('Failed to set auth persistence:', error);
        });
    }

    console.log('Firebase auth instance created successfully');
    return auth;
  } catch (error) {
    console.error('Failed to get Firebase auth:', error);
    return null;
  }
}

// Enhanced user synchronization function with retry logic
export async function syncUserWithDatabase(user: any, retries = 3) {
  if (!user || typeof window === 'undefined') return;

  let attempt = 0;

  while (attempt < retries) {
    try {
      console.log(`🔄 Syncing user with database (attempt ${attempt + 1}/${retries}):`, user.uid);

      // Check if user already exists in database
      const checkResponse = await fetch(`/api/users?uid=${user.uid}`);
      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        console.error('❌ Failed to check user in database:', checkData);
        throw new Error(checkData.error || 'Failed to check user in database');
      }

      // If user doesn't exist in database, create them
      if (!checkData.user) {
        console.log('📝 User not found in database, creating...');

        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        });

        const createData = await createResponse.json();

        if (createResponse.ok) {
          console.log('✅ User created in database:', user.uid);
          return createData.user;
        } else {
          console.error('❌ Failed to create user in database:', createData);
          throw new Error(createData.error || 'Failed to create user');
        }
      } else {
        console.log('✅ User already exists in database:', user.uid);
        return checkData.user;
      }
    } catch (error: any) {
      attempt++;
      console.error(`❌ Error syncing user with database (attempt ${attempt}/${retries}):`, error.message);

      if (attempt >= retries) {
        console.error('❌ All retry attempts failed for user sync');
        throw new Error(`Failed to sync user after ${retries} attempts: ${error.message}`);
      }

      // Wait before retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying user sync in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
