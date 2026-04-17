import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, AlertCircle, Crosshair, User as UserIcon } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { generateScramble } from '../lib/cube';
import { db, doc, getDocFromServer, collection, query, where, getDocs } from '../firebase';
import { RANKS, getRankFromPoints } from '../lib/ranks';

interface TournamentMatchProps {
  user: User | null;
  onSolveComplete: (time: number, won?: boolean) => void;
}

type MatchState = 'waiting' | 'countdown' | 'inspection' | 'ready' | 'solving' | 'finished';

const OPPONENT_NAMES = [
  "ShadowCubed", "SpeedDemon99", "CubeNinja", "FastFingers", "BlockMaster",
  "TwistAndShout", "RubiksRacer", "QuantumCuber", "NeonSolver", "PixelPusher",
  "GhostCuber", "VortexSolver", "RapidTurns", "CyberCuber", "TurboTwist",
  "Alex_Solves", "SarahCubes", "ProGamer_X", "TheCubingGuy", "MysterySolver"
];

export const TournamentMatch: React.FC<TournamentMatchProps> = ({ user, onSolveComplete }) => {
  const navigate = useNavigate();
  const [scramble, setScramble] = useState('');
  const [opponentName, setOpponentName] = useState('');
  
  const [matchState, setMatchState] = useState<MatchState>('waiting');
  const [countdown, setCountdown] = useState<number | string>(3);
  const [inspectionTime, setInspectionTime] = useState(15);
  
  const [userTime, setUserTime] = useState(0);
  const [opponentTime, setOpponentTime] = useState(0);
  
  const [isUserFinished, setIsUserFinished] = useState(false);
  const [isOpponentFinished, setIsOpponentFinished] = useState(false);
  
  const [opponentFinalTime, setOpponentFinalTime] = useState(0);
  const [opponentInspectionTime, setOpponentInspectionTime] = useState(0);
  
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const spaceDownTimeRef = useRef<number>(0);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const opponentTimerRef = useRef<number | null>(null);
  const opponentStartTimeRef = useRef<number>(0);

  useEffect(() => {
    setScramble(generateScramble('3x3'));
    setOpponentName(OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)]);
    
    const setupOpponent = async () => {
      let baseTimeMs = 35000; // Default fallback
      
      if (user) {
        try {
          // Fetch user's solo solves to calculate average
          const q = query(collection(db, 'solves'), where('uid', '==', user.uid));
          const solveSnap = await getDocs(q);
          
          if (!solveSnap.empty) {
            const soloSolves = solveSnap.docs
              .map(d => d.data().time)
              .filter(t => typeof t === 'number' && t > 0);
            
            if (soloSolves.length > 0) {
              // Calculate average of all solo solves (solves are stored in seconds)
              const avg = soloSolves.reduce((a, b) => a + b, 0) / soloSolves.length;
              baseTimeMs = avg * 1000; // Convert to milliseconds for internal timer
            }
          } else {
            // Fallback to rank-based if no solves yet (though tournament should be locked)
            const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const points = userDoc.data().points || 0;
              const currentRank = getRankFromPoints(points);
              const rankIndex = RANKS.findIndex(r => r.name === currentRank.name);
              baseTimeMs = 35000 - (rankIndex * 1000);
            }
          }
        } catch (e) {
          console.error("Failed to fetch user data for opponent scaling", e);
        }
      }
      
      // Add randomness: +/- 10% for a "fair" challenge
      const variance = baseTimeMs * 0.10;
      const finalTime = baseTimeMs + (Math.random() * variance * 2 - variance);
      
      setOpponentFinalTime(Math.floor(finalTime));
      setOpponentInspectionTime(Math.floor(Math.random() * 8000) + 2000); // 2s to 10s
    };

    setupOpponent();
  }, [user]);

  const inspectionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (opponentTimerRef.current) clearInterval(opponentTimerRef.current);
    };
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (matchState === 'countdown') {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else if (count === 0) {
          setCountdown('GO!');
        } else {
          clearInterval(interval);
          setMatchState('inspection');
          inspectionStartTimeRef.current = performance.now();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchState]);

  // Inspection Logic
  useEffect(() => {
    if (matchState === 'inspection' || matchState === 'ready') {
      const interval = setInterval(() => {
        setInspectionTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startUserSolve();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchState]);

  // Opponent Logic
  useEffect(() => {
    if (matchState === 'inspection' || matchState === 'ready' || matchState === 'solving') {
      const checkOpponentStart = setInterval(() => {
        if (!isOpponentFinished && opponentTimerRef.current === null) {
          const elapsedSinceInspection = performance.now() - inspectionStartTimeRef.current;
          if (elapsedSinceInspection >= opponentInspectionTime) {
            // Opponent starts solving
            opponentStartTimeRef.current = performance.now();
            opponentTimerRef.current = window.setInterval(() => {
              const elapsed = performance.now() - opponentStartTimeRef.current;
              if (elapsed >= opponentFinalTime) {
                setOpponentTime(opponentFinalTime);
                setIsOpponentFinished(true);
                if (opponentTimerRef.current) clearInterval(opponentTimerRef.current);
              } else {
                setOpponentTime(elapsed);
              }
            }, 10);
            clearInterval(checkOpponentStart);
          }
        } else {
          clearInterval(checkOpponentStart);
        }
      }, 50);
      return () => clearInterval(checkOpponentStart);
    }
  }, [matchState, isOpponentFinished, opponentInspectionTime, opponentFinalTime]);

  const startUserSolve = useCallback(() => {
    setMatchState('solving');
    startTimeRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      setUserTime(performance.now() - startTimeRef.current);
    }, 10);
  }, []);

  const stopUserSolve = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const finalTimeMs = performance.now() - startTimeRef.current;
    const finalTimeSeconds = finalTimeMs / 1000;
    setUserTime(finalTimeMs);
    setIsUserFinished(true);
    setMatchState('finished');
    
    // Determine if user won based on current opponent time or final time if opponent finished
    const userWon = !isOpponentFinished || finalTimeMs < opponentFinalTime;
    onSolveComplete(finalTimeSeconds, userWon);
  }, [onSolveComplete, isOpponentFinished, opponentFinalTime]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        if (matchState === 'inspection') {
          setIsSpaceDown(true);
          spaceDownTimeRef.current = performance.now();
        } else if (matchState === 'solving') {
          stopUserSolve();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        if (matchState === 'inspection' && isReady) {
          startUserSolve();
        } else if (matchState === 'ready') {
          startUserSolve();
        }
        setIsReady(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [matchState, isReady, startUserSolve, stopUserSolve]);

  // Check if space is held long enough to be ready
  useEffect(() => {
    if (isSpaceDown && matchState === 'inspection') {
      const interval = setInterval(() => {
        if (performance.now() - spaceDownTimeRef.current >= 300) {
          setIsReady(true);
          setMatchState('ready');
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isSpaceDown, matchState]);

  // Touch controls
  const handleTouchStart = () => {
    if (matchState === 'inspection') {
      setIsSpaceDown(true);
      spaceDownTimeRef.current = performance.now();
    } else if (matchState === 'solving') {
      stopUserSolve();
    }
  };

  const handleTouchEnd = () => {
    setIsSpaceDown(false);
    if (matchState === 'inspection' && isReady) {
      startUserSolve();
    } else if (matchState === 'ready') {
      startUserSolve();
    }
    setIsReady(false);
  };

  if (!user) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Return to Base
        </button>
      </div>
    );
  }

  const formatDisplayTime = (ms: number) => {
    if (ms === 0) return "0.00";
    return formatTime(ms / 1000);
  };

  const userWon = isUserFinished && isOpponentFinished && userTime < opponentFinalTime;
  const opponentWon = isUserFinished && isOpponentFinished && userTime > opponentFinalTime;

  return (
    <div 
      className="min-h-screen w-full bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <button 
          onClick={() => navigate('/tournament')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-5 h-5" /> Flee Match
        </button>
        
        <div className="flex items-center gap-3">
          <span className="bg-red-500/20 text-red-500 text-sm px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-2 border border-red-500/30">
            <Flame className="w-4 h-4" /> Live Heat
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 lg:p-8 relative">
        
        {/* Scramble Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 text-center shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Official Scramble</div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-wide leading-relaxed">
            {scramble}
          </div>
        </div>

        {/* Timers Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* User Timer */}
          <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
            userWon ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 
            opponentWon ? 'bg-slate-900/50 border-slate-800 opacity-50' :
            'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                <UserIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-xl font-black text-white uppercase tracking-wider">{user.displayName || 'You'}</div>
            </div>
            
            <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter transition-colors ${
              matchState === 'ready' ? 'text-emerald-400' :
              isSpaceDown ? 'text-red-400' :
              'text-white'
            }`}>
              {matchState === 'inspection' || matchState === 'ready' ? inspectionTime : formatDisplayTime(userTime)}
            </div>
            
            <div className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              {matchState === 'inspection' || matchState === 'ready' ? 'Inspection' : 
               matchState === 'solving' ? 'Solving...' : 
               isUserFinished ? 'Finished' : 'Waiting'}
            </div>
          </div>

          {/* Opponent Timer */}
          <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
            opponentWon ? 'bg-red-900/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
            userWon ? 'bg-slate-900/50 border-slate-800 opacity-50' :
            'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <Crosshair className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-xl font-black text-white uppercase tracking-wider">{opponentName || 'Opponent'}</div>
            </div>
            
            <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-slate-300">
              {formatDisplayTime(opponentTime)}
            </div>
            
            <div className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              {!isOpponentFinished && opponentTime > 0 ? 'Solving...' : 
               isOpponentFinished ? 'Finished' : 'Waiting'}
            </div>
          </div>

        </div>

        {/* Overlays */}
        {matchState === 'waiting' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-3xl">
            <button 
              onClick={() => setMatchState('countdown')}
              className="bg-red-600 hover:bg-red-500 text-white px-12 py-6 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_rgba(220,38,38,0.7)] transition-all hover:scale-105 active:scale-95"
            >
              Ready
            </button>
          </div>
        )}

        {matchState === 'countdown' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-3xl">
            <div className="text-[15rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {matchState === 'finished' && !isOpponentFinished && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-3xl flex-col gap-6">
            <div className="text-4xl font-black text-emerald-400 uppercase tracking-widest animate-pulse">
              Finished!
            </div>
            <div className="text-slate-400 font-bold uppercase tracking-widest">
              Waiting for opponent to finish...
            </div>
          </div>
        )}

        {matchState === 'finished' && isOpponentFinished && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-3xl flex-col gap-8">
            <div className={`text-6xl md:text-8xl font-black uppercase tracking-tighter ${userWon ? 'text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.5)]' : 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]'}`}>
              {userWon ? 'Victory' : 'Defeat'}
            </div>
            
            <div className="flex gap-8 text-center">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 min-w-[200px]">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Your Time</div>
                <div className="text-3xl font-mono font-black text-white">{formatDisplayTime(userTime)}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 min-w-[200px]">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Opponent</div>
                <div className="text-3xl font-mono font-black text-slate-400">{formatDisplayTime(opponentFinalTime)}</div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/tournament')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
