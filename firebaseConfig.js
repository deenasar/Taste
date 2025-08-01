import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

console.log('🔥 Initializing Firebase config...');

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDxdAGoIB2m4oWgdpwo599VJAyv_AnAXn8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "taste-f98f9.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "taste-f98f9",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "taste-f98f9.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "362697450475",
  appId: process.env.FIREBASE_APP_ID || "1:362697450475:web:a37f4f08b9a92016feafae"
};

console.log('🔥 Firebase config loaded, initializing app...');
let app;
let FIREBASE_DB;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  FIREBASE_DB = getFirestore(app);
  console.log('✅ Firestore initialized');
} catch (error) {
  console.log('❌ Firebase initialization failed:', error);
  throw error;
}

export { FIREBASE_DB, firebaseConfig };

