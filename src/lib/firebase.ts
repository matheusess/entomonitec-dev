import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import logger from '@/lib/logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_iPKPLQrycz34XrxgyM2DIO0cDzym5Mc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "entomonitec.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "entomonitec",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "entomonitec.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "128431137436",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:128431137436:web:7e558e3960ba2bc4454359",
};

// Verificação silenciosa das variáveis (usando fallbacks)
const isUsingFallbacks = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (isUsingFallbacks) {
  logger.log('🔧 Firebase: Usando configurações de desenvolvimento (fallback)');
}

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export default
export default app;

