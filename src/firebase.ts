import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, getDocFromServer, getDoc, setDoc, getDocs, runTransaction, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { toast } from 'sonner';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, (firebaseConfig as any).firestoreDatabaseId);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      console.log("Login popup closed or cancelled by user.");
      return;
    }
    console.error("Error logging in with Google", error);
    toast.error(`Login failed: ${error.message}`);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out", error);
  }
};

export const loginWithPassword = async (email: string, pass: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    // If user doesn't exist, try to auto-register for this demo app
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
        toast.success("NEW_IDENTITY_SYNCHRONIZED");
      } catch (regError: any) {
        toast.error(`VERIFICATION_FAILED: ${regError.message}`);
      }
    } else {
      toast.error(`VERIFICATION_FAILED: ${error.message}`);
    }
  }
};

export { collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, setDoc, getDocs, runTransaction, writeBatch, getDocFromServer, getDoc };
