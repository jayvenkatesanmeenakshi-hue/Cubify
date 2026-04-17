import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { TimerPage } from './pages/TimerPage';
import { SolverPage } from './pages/SolverPage';
import { AICoachPage } from './pages/AICoachPage';
import { generateScramble } from './lib/cube';
import { auth, db, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, getDoc, setDoc } from './firebase';
import { syncEcosystemUser } from './services/ecosystemService';
import { User } from 'firebase/auth';
import { SolveRecord, PuzzleType } from './types';
import { handleFirestoreError, OperationType } from './lib/firestoreError';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';

import { SocialPage } from './pages/SocialPage';
import { HomePage } from './pages/HomePage';
import { TournamentPage } from './pages/TournamentPage';
import { TournamentMatch } from './pages/TournamentMatch';
import { TrainerPage } from './pages/TrainerPage';
import { ClansPage } from './pages/ClansPage';

const AppRoutes = ({ user, puzzle, setPuzzle, scramble, setScramble, solves, handleSolveComplete, handleDeleteSolve, resetSession }: any) => {
  const location = useLocation();
  const currentPuzzleSolves = solves.filter((s: any) => s.puzzle === puzzle || (!s.puzzle && puzzle === '3x3'));

  return (
    <AnimatePresence mode="wait">
      <Toaster position="top-center" richColors />
      <Routes location={location} key={location.pathname === '/tournament' ? 'tournament' : 'main'}>
        <Route path="/tournament" element={
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <TournamentPage user={user} />
          </motion.div>
        } />
        <Route path="/tournament/match" element={
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <TournamentMatch user={user} onSolveComplete={handleSolveComplete} />
          </motion.div>
        } />
        <Route path="/" element={
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Layout user={user} />
          </motion.div>
        }>
          <Route index element={user ? <HomePage user={user} solves={solves} /> : <Landing />} />
          <Route path="timer" element={
            <TimerPage 
              scramble={scramble} 
              solves={currentPuzzleSolves} 
              onSolveComplete={handleSolveComplete} 
              onDeleteSolve={handleDeleteSolve} 
              onResetSession={resetSession} 
              puzzle={puzzle}
              onPuzzleChange={setPuzzle}
            />
          } />
          <Route path="solver" element={<SolverPage />} />
          <Route path="coach" element={<AICoachPage />} />
          <Route path="trainer" element={<TrainerPage />} />
          <Route path="clans" element={<ClansPage />} />
          <Route path="social" element={<SocialPage user={user} />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [puzzle, setPuzzle] = useState<PuzzleType>('3x3');
  const [scramble, setScramble] = useState<string>('');
  const [solves, setSolves] = useState<SolveRecord[]>([]);

  // Initialize scramble
  useEffect(() => {
    setScramble(generateScramble(puzzle));
  }, [puzzle]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync with StarVortex Ecosystem
        syncEcosystemUser(currentUser, 'Cubify');

        // Initialize user profile with friendId if it doesn't exist
        const userRef = doc(db, 'users', currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            const friendId = Math.floor(10000000 + Math.random() * 90000000).toString();
            setDoc(userRef, {
              points: 0,
              displayName: currentUser.displayName || 'Cuber',
              photoURL: currentUser.photoURL || '',
              friendId: friendId
            }).catch(e => console.error("Error creating user profile:", e));
          } else if (!docSnap.data().friendId) {
            const friendId = Math.floor(10000000 + Math.random() * 90000000).toString();
            setDoc(userRef, { friendId }, { merge: true }).catch(e => console.error("Error updating user profile:", e));
          }
        }).catch(e => console.error("Error fetching user profile", e));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch solves
  useEffect(() => {
    if (!user) {
      setSolves([]);
      return;
    }

    const q = query(
      collection(db, 'solves'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSolves: SolveRecord[] = [];
      snapshot.forEach((doc) => {
        fetchedSolves.push({ id: doc.id, ...doc.data() } as SolveRecord);
      });
      setSolves(fetchedSolves);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'solves');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSolveComplete = async (time: number, wonTournamentMatch?: boolean) => {
    const currentScramble = scramble;
    setScramble(generateScramble(puzzle)); // Generate new scramble immediately

    if (user) {
      try {
        await addDoc(collection(db, 'solves'), {
          uid: user.uid,
          time,
          scramble: currentScramble,
          date: serverTimestamp(),
          penalty: '',
          puzzle: puzzle
        });

        // Tournament logic
        const isTournament = window.location.pathname.includes('/tournament/match') || new URLSearchParams(window.location.search).get('mode') === 'tournament';

        if (isTournament) {
          const today = new Date().toISOString().split('T')[0];
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const currentMatches = data.lastMatchDate === today ? (data.matchesPlayedToday || 0) : 0;
            
            if (currentMatches < 20) {
              let pointsEarned = 0;
              if (wonTournamentMatch !== false) { // If true or undefined (legacy)
                const timeInSeconds = time;
                const speedBonus = Math.max(0, Math.floor(100 - timeInSeconds));
                pointsEarned = 10 + speedBonus;
              } else {
                // Lost the race, maybe just 5 participation points? Or 0? Let's say 0 for now.
                pointsEarned = 0;
              }

              await setDoc(userRef, {
                points: (data.points || 0) + pointsEarned,
                matchesPlayedToday: currentMatches + 1,
                lastMatchDate: today
              }, { merge: true });
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'solves');
      }
    } else {
      // Local only if not logged in
      setSolves(prev => [{
        id: Math.random().toString(),
        uid: 'local',
        time,
        scramble: currentScramble,
        date: new Date(),
        penalty: '',
        puzzle: puzzle
      }, ...prev]);
    }
  };

  const handleDeleteSolve = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'solves', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `solves/${id}`);
      }
    } else {
      setSolves(prev => prev.filter(s => s.id !== id));
    }
  };

  const resetSession = () => {
    if (window.confirm("Are you sure you want to reset your local session? This won't delete saved solves from your account, but will clear the current view if you are not logged in.")) {
      if (!user) {
        setSolves([]);
      }
      setScramble(generateScramble(puzzle));
    }
  };

  return (
    <BrowserRouter>
      <AppRoutes 
        user={user}
        puzzle={puzzle}
        setPuzzle={setPuzzle}
        scramble={scramble}
        setScramble={setScramble}
        solves={solves}
        handleSolveComplete={handleSolveComplete}
        handleDeleteSolve={handleDeleteSolve}
        resetSession={resetSession}
      />
    </BrowserRouter>
  );
}
