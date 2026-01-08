import {
  initializeApp,
  getApps,
  cert,
  ServiceAccount,
  App,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminDb: Firestore;
let adminAuth: Auth;

function initializeFirebaseAdmin(): App {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    console.error("FIREBASE_PROJECT_ID is not set in environment variables");
    throw new Error("Firebase Admin: Missing FIREBASE_PROJECT_ID");
  }

  if (!clientEmail) {
    console.error("FIREBASE_CLIENT_EMAIL is not set in environment variables");
    throw new Error("Firebase Admin: Missing FIREBASE_CLIENT_EMAIL");
  }

  if (!privateKey) {
    console.error("FIREBASE_PRIVATE_KEY is not set in environment variables");
    throw new Error("Firebase Admin: Missing FIREBASE_PRIVATE_KEY");
  }

  try {
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      // Handle escaped newlines in private key (common in .env files)
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };

    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully");
    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

// Initialize on module load
try {
  adminApp = initializeFirebaseAdmin();
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
  // Create a mock/fallback for development if needed
  // This prevents the app from crashing on startup if Firebase is not configured
}

export { adminDb, adminAuth, adminApp };
