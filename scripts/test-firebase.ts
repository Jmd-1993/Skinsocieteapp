#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin (same as in your firebase-admin.ts)
if (!admin.apps.length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firebase Admin initialization
    const app = admin.app();
    console.log('✅ Firebase Admin initialized successfully');
    console.log('📋 Project ID:', app.options.projectId);
    
    // Test messaging service
    const messaging = admin.messaging();
    console.log('✅ Firebase Messaging service initialized');
    
    // Test a dry-run notification (won't actually send)
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'Firebase connection test successful!'
      },
      topic: 'test-topic' // Using topic instead of token for testing
    };
    
    console.log('🧪 Testing message validation...');
    const response = await messaging.send(message, true); // dry run
    console.log('✅ Message validation successful:', response);
    
    console.log('🎉 Firebase setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    
    if (error.code === 'messaging/invalid-argument') {
      console.log('💡 This error is expected - it means Firebase is connected but we need a real device token');
    }
    
    process.exit(1);
  }
}

testFirebaseConnection();