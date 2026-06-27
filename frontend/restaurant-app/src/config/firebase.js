import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured =
    firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-firebase-api-key';

let app;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        throw new Error('Firebase Auth is not configured. Please add your credentials to .env file.');
    }

    await firebaseSignOut(auth).catch(() => undefined);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.getIdToken(true);
};

export const signOut = () => {
    if (isFirebaseConfigured) {
        return firebaseSignOut(auth);
    }
    return Promise.resolve();
};

export { auth };
export default app;
