import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, getDocFromServer, getDoc, setDoc, getDocs, runTransaction, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
    alert(`Login failed: ${error.message}`);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out", error);
  }
};

export { collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, setDoc, getDocs, runTransaction, writeBatch, getDocFromServer, getDoc };
