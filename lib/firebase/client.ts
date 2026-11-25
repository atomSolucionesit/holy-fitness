"use client";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
}

function getFirebaseApp(override?: FirebaseClientConfig): FirebaseApp {
  const apiKey = override?.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = override?.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = override?.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = override?.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Falta configurar Firebase en las variables de entorno");
  }

  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  return initializeApp({ apiKey, authDomain, projectId, appId });
}

export async function signInWithGooglePopup(config?: FirebaseClientConfig): Promise<string> {
  const app = getFirebaseApp(config);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user.getIdToken();
}
