import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

const mainframeConfig = {
  apiKey: "AIzaSyB-PCtfyvVk4jgKR3fwK78vhqPC0W_0lqA",
  authDomain: "gen-lang-client-0653546461.firebaseapp.com",
  projectId: "gen-lang-client-0653546461",
};

const databaseId = "ai-studio-b01f7cc1-a387-4e70-ac1f-092def9e2753";

// Initialize secondary app
const mainframeApp = !getApps().find(app => app.name === 'mainframe') 
  ? initializeApp(mainframeConfig, 'mainframe')
  : getApp('mainframe');

const mainframeAuth = getAuth(mainframeApp);
const mainframeDb = getFirestore(mainframeApp, databaseId);

export const syncWithMainframe = async (user: User) => {
  try {
    // Sign in anonymously to the mainframe
    await signInAnonymously(mainframeAuth);

    // Upsert user profile into mainframe
    const profileRef = doc(mainframeDb, 'profiles', user.uid);
    await setDoc(profileRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      app_source: "CubifyAI",
      last_login: serverTimestamp()
    }, { merge: true });

    console.log("Successfully synced with StarVortex Mainframe");
  } catch (error) {
    console.error("Failed to sync with StarVortex Mainframe:", error);
  }
};
