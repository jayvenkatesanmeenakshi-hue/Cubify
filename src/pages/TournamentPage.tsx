import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, collection, getDocs, query, orderBy, limit, doc, onSnapshot, where } from '../firebase';
import { Trophy, Ticket, Flame, ChevronUp, ChevronDown, Minus, Clock, AlertCircle, ArrowLeft, Crosshair, Shield, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RANKS, getRankFromPoints, getNextRank } from '../lib/ranks';

interface TournamentPageProps {
  user: User | null;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [myPoints, setMyPoints] = useState(0);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [bracketPlayers, setBracketPlayers] = useState<any[]>([]);
  const [solveCount, setSolveCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch solve count for unlocking
    const qSolves = query(collection(db, 'solves'), where('uid', '==', user.uid));
    const unsubscribeSolves = onSnapshot(qSolves, (snap) => {
      setSolveCount(snap.size);
    });
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMyPoints(data.points || 0);
        
        const today = new Date().toISOString().split('T')[0];
        if (data.lastMatchDate === today) {
          setMatchesPlayed(data.matchesPlayedToday || 0);
        } else {
          setMatchesPlayed(0);
        }
      }
    });

    const fetchBracket = async () => {
      try {
        // In a real app, we would query users in the SAME rank.
        // For this demo, we fetch top users and simulate the bracket.
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(100));
        const snap = await getDocs(q);
        const players = snap.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || 'Unknown',
            points: data.points || 0,
            isMe: doc.id === user.uid,
            rank: index + 1,
            status: index < 20 ? 'promote' : index < 50 ? 'maintain' : 'demote'
          };
        });
        setBracketPlayers(players);
      } catch (e) {
        console.error("Error fetching bracket", e);
      }
    };
    
    fetchBracket();
    return () => {
      unsubscribe();
      unsubscribeSolves();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-slate-400 mb-8">You must be logged in to enter the Arena.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Return to Base
        </Link>
      </div>
    );
  }

  const currentRank = getRankFromPoints(myPoints);
  const nextRank = getNextRank(myPoints);
  
  const getRankColor = (rankName: string) => {
    if (rankName.includes('WOOD')) return 'text-amber-700';
    if (rankName.includes('BRONZE')) return 'text-orange-400';
    if (rankName.includes('SILVER')) return 'text-slate-300';
    if (rankName.includes('GOLD')) return 'text-yellow-400';
    if (rankName.includes('PLATINUM')) return 'text-cyan-300';
    if (rankName.includes('DIAMOND')) return 'text-blue-400';
    if (rankName.includes('EXPERT')) return 'text-purple-400';
    if (rankName.includes('MASTER')) return 'text-red-500';
    if (rankName.includes('GRANDMASTER')) return 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]';
    return 'text-slate-400';
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Base
        </button>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Crosshair className="w-4 h-4 text-red-500" />
            <span className="font-mono font-bold text-slate-200">{Math.max(0, 20 - matchesPlayed)} Matches Left</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Crosshair className="w-10 h-10 text-red-500" />
            Daily Heat
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2 font-mono text-sm">
            <Clock className="w-4 h-4 text-red-500" /> HEAT ENDS IN: <span className="text-white">14:22:09</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Player Status */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-indigo-500" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full group-hover:bg-red-500/20 transition-all" />
              
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Division</div>
              <div className={`text-4xl font-black mb-1 uppercase tracking-tight ${getRankColor(currentRank.name)}`}>
                {currentRank.name}
              </div>
              <div className="text-slate-400 text-sm font-mono mb-8">Bracket #A-4092</div>
              
              {solveCount !== null && solveCount < 10 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center mb-4">
                  <Lock className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Arena Locked</div>
                  <div className="text-xs text-slate-500 font-mono">
                    Complete <span className="text-yellow-500">{10 - solveCount}</span> more solo solves to unlock the tournament.
                  </div>
                  <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500" 
                      style={{ width: `${(solveCount / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/tournament/match')}
                  disabled={matchesPlayed >= 20}
                  className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${matchesPlayed >= 20 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] active:scale-95'}`}
                >
                  <Flame className="w-6 h-6" />
                  {matchesPlayed >= 20 ? 'Daily Limit Reached' : 'Enter Match'}
                </button>
              )}
              <div className="text-center mt-3 text-xs font-mono text-slate-500">
                MATCHES TODAY: <span className={matchesPlayed >= 20 ? 'text-red-500' : 'text-white'}>{matchesPlayed} / 20</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-white font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Tournament Rules
              </h3>

              <div className="space-y-6 text-sm font-mono">
                <div>
                  <div className="text-slate-500 mb-2 font-bold tracking-wider text-xs">SCORING SYSTEM</div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Base Completion</span>
                      <span className="text-emerald-400 font-bold">+10 pts</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Speed Bonus</span>
                      <span className="text-emerald-400 font-bold">Up to +90 pts</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-3 pt-3 border-t border-slate-800/50 leading-relaxed">
                      Points are awarded based on solve time. Faster solves yield higher speed bonuses. Max 100 pts per match.
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-2 font-bold tracking-wider text-xs">BRACKET PLACEMENT</div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <ChevronUp className="w-5 h-5" /> 
                      <span>Top 20 <span className="text-slate-500 ml-2">Promote to {nextRank?.name || 'MAX'}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Minus className="w-5 h-5" /> 
                      <span>21 - 50 <span className="text-slate-600 ml-2">Maintain Rank</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-red-500">
                      <ChevronDown className="w-5 h-5" /> 
                      <span>51 - 100 <span className="text-slate-600 ml-2">Demote</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-[700px]">
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h3 className="font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Live Standings
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">100 PLAYERS</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="space-y-1">
                {bracketPlayers.length > 0 ? bracketPlayers.map((player) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center p-3 rounded-xl transition-colors ${player.isMe ? 'bg-indigo-600/20 border border-indigo-500/50' : 'hover:bg-slate-800 border border-transparent'}`}
                  >
                    <div className="w-12 text-center font-mono font-bold text-slate-500">
                      {player.rank.toString().padStart(2, '0')}
                    </div>
                    <div className="w-10 flex justify-center">
                      {player.status === 'promote' && <ChevronUp className="w-5 h-5 text-emerald-400" />}
                      {player.status === 'maintain' && <Minus className="w-5 h-5 text-slate-600" />}
                      {player.status === 'demote' && <ChevronDown className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className={`flex-1 font-bold tracking-wide ml-2 ${player.isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {player.displayName}
                      {player.isMe && <span className="ml-3 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">You</span>}
                    </div>
                    <div className="font-mono font-bold text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {player.points.toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm uppercase tracking-widest">
                    No players found in this bracket.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1);
        }
      `}</style>
    </div>
  );
};
