import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Check if we have valid Firebase credentials
const hasValidCredentials = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PROJECT_ID !== 'placeholder-project-id';

let app: any = null;
let messaging: any = null;

// Only initialize Firebase if we have valid credentials
if (hasValidCredentials) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  };

  // Initialize Firebase Admin SDK (only once)
  app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
  messaging = getMessaging(app);
} else {
  console.warn('Firebase Admin SDK not initialized - missing or invalid credentials');
}

export { messaging };
export default app;