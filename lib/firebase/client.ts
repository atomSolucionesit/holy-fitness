"use client";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function getFirebaseApp(): FirebaseApp {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Falta configurar Firebase en las variables de entorno");
  }

  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  return initializeApp({ apiKey, authDomain, projectId, appId });
}

export async function signInWithGooglePopup(): Promise<string> {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user.getIdToken();
}
