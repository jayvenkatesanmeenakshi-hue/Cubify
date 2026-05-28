import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { auth, db, onSnapshot, doc, getDoc, setDoc } from './firebase';
import { syncEcosystemUser } from './services/ecosystemService';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';

import { SocialPage } from './pages/SocialPage';
import { HomePage } from './pages/HomePage';
import { PassportAuth } from './pages/PassportAuth';

const AppRoutes = ({ user }: any) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Toaster position="top-center" richColors />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {user ? <HomePage user={user} /> : <Landing />}
          </motion.div>
        } />
        <Route path="/social" element={<SocialPage user={user} />} />
        <Route path="/passport" element={<PassportAuth user={user} />} />
        {/* Dedicated Ecosystem Login Nodes */}
        <Route path="/grindos-login" element={<PassportAuth user={user} forcedClientId="grindos" />} />
        <Route path="/explainerx-login" element={<PassportAuth user={user} forcedClientId="explainerx" />} />
        <Route path="/fireink-login" element={<PassportAuth user={user} forcedClientId="fireink" />} />
        <Route path="/chronos-login" element={<PassportAuth user={user} forcedClientId="chronos" />} />
        <Route path="/starvortex-login" element={<PassportAuth user={user} forcedClientId="starvortex" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync with StarVortex Ecosystem as Passport
        syncEcosystemUser(currentUser, 'Passport');

        // Initialize user profile
        const userRef = doc(db, 'users', currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            const friendId = Math.floor(10000000 + Math.random() * 90000000).toString();
            const defaultName = currentUser.email ? currentUser.email.split('@')[0].toUpperCase() : 'GRID_VOYAGER';
            setDoc(userRef, {
              points: 0,
              displayName: currentUser.displayName || defaultName,
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`,
              friendId: friendId,
              bio: 'Exploring the StarVortex ecosystem.',
              aura: 10,
              linkedApps: ['Passport']
            }).catch(e => console.error("Error creating user profile:", e));
          }
        }).catch(e => console.error("Error fetching user profile", e));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes user={user} />
    </BrowserRouter>
  );
}
