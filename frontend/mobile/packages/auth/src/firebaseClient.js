/**
 * Firebase Authentication Client for React Native
 * =================================================
 * Mirrors the web app's firebaseClient.js but uses native Google Sign-In
 * via @react-native-google-signin/google-signin instead of signInWithPopup.
 *
 * Flow:
 *   1. GoogleSignin.signIn() → native Google picker → Google ID token
 *   2. GoogleAuthProvider.credential(googleIdToken) → Firebase credential
 *   3. signInWithCredential(auth, credential) → Firebase authenticates
 *   4. user.getIdToken(true) → Firebase ID token
 *   5. Send Firebase ID token to POST /api/auth/firebase/ on Django backend
 *
 * This gives us one auth flow for both web and mobile.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// ── Firebase Configuration ──
// Uses the same Firebase project as the web app (pecafoo-firebase).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-firebase-project-id';

let app;
let auth;

if (isFirebaseConfigured) {
  // Only initialize if not already done (prevents hot-reload crashes)
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Use AsyncStorage for Firebase auth persistence on React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// ── Google Sign-In Configuration ──
const configureGoogleSignIn = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId || webClientId.startsWith('YOUR_')) {
    console.warn(
      '[@pecafoo/auth] Google Web Client ID is not configured. ' +
      'Google Sign-In will not work. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.'
    );
    return false;
  }

  GoogleSignin.configure({
    webClientId,
    // Platform-specific client IDs — Google Sign-In uses the web client ID
    // as the audience for the ID token on all platforms, but needs the
    // platform-specific ones for native sign-in flows.
    ...(Platform.OS === 'android' && androidClientId && !androidClientId.startsWith('YOUR_')
      ? { androidClientId }
      : {}),
    ...(Platform.OS === 'ios' && iosClientId && !iosClientId.startsWith('YOUR_')
      ? { iosClientId }
      : {}),
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });

  return true;
};

let googleSignInConfigured = false;

/**
 * Sign in with Google using native picker, then authenticate with Firebase.
 * Returns the Firebase ID token to send to the Django backend.
 *
 * @returns {Promise<string>} Firebase ID token
 * @throws {Error} With user-friendly message
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Add your Firebase credentials to the .env file.'
    );
  }

  // Configure Google Sign-In on first call (lazy init)
  if (!googleSignInConfigured) {
    googleSignInConfigured = configureGoogleSignIn();
  }

  if (!googleSignInConfigured) {
    throw new Error(
      'Google Sign-In is not configured. Add your Google Client IDs to the .env file.'
    );
  }

  try {
    // Check if Google Play Services are available (Android only)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign out first to force account picker (matches web behavior: prompt: 'select_account')
    await GoogleSignin.signOut().catch(() => undefined);

    // Native Google Sign-In
    const signInResult = await GoogleSignin.signIn();

    const idToken = signInResult?.data?.idToken;
    if (!idToken) {
      throw new Error('Google Sign-In succeeded but no ID token was returned.');
    }

    // Create Firebase credential from Google ID token
    const credential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with the Google credential
    const userCredential = await signInWithCredential(auth, credential);

    // Get the Firebase ID token (this is what the backend verifies)
    const firebaseIdToken = await userCredential.user.getIdToken(true);

    return firebaseIdToken;
  } catch (error) {
    // Map Google Sign-In error codes to user-friendly messages
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Sign-in was cancelled.');
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign-in is already in progress.');
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error(
        'Google Play Services is not available. Please update Google Play Services.'
      );
    }

    // Re-throw with original message for Firebase or unexpected errors
    console.error('[@pecafoo/auth] Google Sign-In error:', error);
    throw error;
  }
};

/**
 * Sign out of Firebase (clears Firebase auth state).
 * Called alongside backend logout to ensure clean state.
 */
export const signOutFirebase = async () => {
  try {
    // Sign out of native Google Sign-In
    await GoogleSignin.signOut().catch(() => undefined);

    // Sign out of Firebase
    if (auth) {
      await firebaseSignOut(auth);
    }
  } catch (error) {
    // Silent — we're logging out regardless
    console.warn('[@pecafoo/auth] Firebase sign-out warning:', error.message);
  }
};

/**
 * Check if Firebase is properly configured.
 * Useful for conditionally showing/hiding Google Sign-In button.
 */
export const isGoogleSignInAvailable = () => {
  if (!isFirebaseConfigured) return false;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  return webClientId && !webClientId.startsWith('YOUR_');
};

export { auth };
export default app;
