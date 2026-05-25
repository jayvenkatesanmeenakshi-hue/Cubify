import { db } from '../firebase'; 
import { doc, setDoc, getDoc, serverTimestamp, getDocFromServer, collection, addDoc } from 'firebase/firestore';

export const syncEcosystemUser = async (user: any, appName: string) => {
  if (!user) return;
  const docRef = doc(db, 'users', user.uid);
  try {
    const docSnap = await getDocFromServer(docRef).catch(() => getDoc(docRef));
    const existingData = docSnap.exists() ? docSnap.data() : null;
    const appsUsed = existingData?.appsUsed || [];
    if (!appsUsed.includes(appName)) {
      appsUsed.push(appName);
    }
    await setDoc(docRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastActive: serverTimestamp(), // Standardized metadata
      appsUsed: appsUsed
    }, { merge: true });
  } catch (error) {
    console.error('Ecosystem Sync Failed:', error);
  }
};

export const APP_ID = 'PASSPORT';
const NODE_TYPE = 'IDENTITY_HUB';

/**
 * Broadcasts an event to the global Activity Stream (/users/{userId}/activities/{activityId})
 */
export const broadcastActivity = async (userId: string, description: string, metadata: any = {}) => {
  try {
    const activityRef = collection(db, 'users', userId, 'activities');
    await addDoc(activityRef, {
      description: `[${APP_ID}]: ${description}`,
      timestamp: serverTimestamp(),
      metadata: {
        app: APP_ID,
        nodeType: NODE_TYPE,
        ...metadata
      }
    });
  } catch (error) {
    console.error('Failed to broadcast ecosystem activity:', error);
  }
};

/**
 * Checks for cross-app dependencies (GrindOS streak, etc.)
 */
export const getEcosystemProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    console.error('Failed to fetch ecosystem profile:', err);
    return null;
  }
};
