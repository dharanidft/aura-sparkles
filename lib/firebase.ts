import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  ActionCodeSettings, 
  UserCredential 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return (
    typeof window !== "undefined" &&
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    !firebaseConfig.apiKey.includes("your-api-key")
  );
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseClientApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
}

export const EMAIL_SIGNIN_STORAGE_KEY = "aura_email_for_signin";

/**
 * Sends a native passwordless Firebase Email Sign-In Link.
 * Zero ongoing SMS costs, uses Firebase Authentication native email delivery.
 */
export async function sendFirebaseEmailSignInLink(
  email: string,
  returnPath: string = "/account"
): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, error: "Firebase Authentication is not configured." };
  }

  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.aurasparkles.com";
    const callbackUrl = `${origin}/auth/verify-link?redirect=${encodeURIComponent(returnPath)}`;

    const actionCodeSettings: ActionCodeSettings = {
      url: callbackUrl,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email.trim().toLowerCase(), actionCodeSettings);

    // Save email in localStorage for same-device verification
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EMAIL_SIGNIN_STORAGE_KEY, email.trim().toLowerCase());
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Firebase Auth] sendSignInLinkToEmail error:", err);
    return { success: false, error: err.message || "Failed to send sign-in link." };
  }
}

/**
 * Checks if the current URL is a valid Firebase email sign-in link
 */
export function isFirebaseEmailSignInLink(url: string): boolean {
  const auth = getFirebaseAuth();
  if (!auth) return false;
  return isSignInWithEmailLink(auth, url);
}

/**
 * Completes sign-in with a verified Firebase email link
 */
export async function signInWithFirebaseEmailLink(
  email: string,
  url: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Authentication is not configured.");

  const credential = await signInWithEmailLink(auth, email.trim().toLowerCase(), url);

  // Clean up localStorage on successful sign-in
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(EMAIL_SIGNIN_STORAGE_KEY);
  }

  return credential;
}
