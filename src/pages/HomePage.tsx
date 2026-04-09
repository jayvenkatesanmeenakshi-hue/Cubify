import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SolveRecord } from '../types';
import { getRankFromPoints, getNextRank } from '../lib/ranks';
import { RankBadge } from '../components/RankBadge';
import { Edit2, Save, X, Activity, Clock, Trophy, TrendingUp } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HomePageProps {
  user: User;
  solves: SolveRecord[];
}

export const HomePage: React.FC<HomePageProps> = ({ user, solves }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setEditName(data.displayName || user.displayName || 'Cuber');
        
        // Self-heal: generate friendId if it's missing
        if (!data.friendId) {
          const newFriendId = Math.floor(10000000 + Math.random() * 90000000).toString();
          setDoc(doc(db, 'users', user.uid), { friendId: newFriendId }, { merge: true }).catch(console.error);
        }
      } else {
        // Fallback while the document is being created by App.tsx
        // Also self-heal by creating the document here just in case App.tsx failed
        const newFriendId = Math.floor(10000000 + Math.random() * 90000000).toString();
        const newProfile = {
          displayName: user.displayName || 'Cuber',
          photoURL: user.photoURL || '',
          points: 0,
          friendId: newFriendId
        };
        setProfile(newProfile);
        setEditName(newProfile.displayName);
        setDoc(doc(db, 'users', user.uid), newProfile, { merge: true }).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    await setDoc(doc(db, 'users', user.uid), { displayName: editName }, { merge: true });
    setIsEditing(false);
  };

  if (!profile) return <div className="p-8 text-slate-500">Loading profile...</div>;

  const currentRank = getRankFromPoints(profile.points || 0);
  const nextRank = getNextRank(profile.points || 0);
  
  const bestTime = solves.length > 0 ? Math.min(...solves.map(s => s.time)) : 0;
  
  // Calculate Averages
  const calculateAverage = (count: number) => {
    if (solves.length < count) return 0;
    const recentSolves = solves.slice(0, count).map(s => s.time).sort((a, b) => a - b);
    // Remove best and worst
    if (count >= 5) {
      recentSolves.pop();
      recentSolves.shift();
    }
    return recentSolves.reduce((a, b) => a + b, 0) / recentSolves.length;
  };

  const ao5 = calculateAverage(5);
  const ao12 = calculateAverage(12);
  const ao100 = calculateAverage(100);

  // Prepare chart data (chronological order)
  const chartData = [...solves].reverse().map((solve, index) => ({
    solveNumber: index + 1,
    time: solve.time / 1000 // Convert to seconds for chart
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={profile.photoURL || user.photoURL} alt="Profile" className="w-24 h-24 rounded-full bg-slate-100 object-cover border-4 border-white shadow-md" referrerPolicy="no-referrer" />
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={handleSave} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Save className="w-4 h-4" /></button>
                  <button onClick={() => { setIsEditing(false); setEditName(profile.displayName); }} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800">{profile.displayName}</h1>
                  <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-500 font-mono">
                <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ID: {profile.friendId || '...'}</span>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <RankBadge rankName={currentRank.name} size="lg" />
            <div className="mt-2 text-slate-500 font-mono font-medium">{profile.points || 0} PTS</div>
          </div>
        </div>

        {nextRank && (
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 font-medium">Progress to {nextRank.name}</span>
              <span className="text-indigo-600 font-bold">{profile.points || 0} / {nextRank.minPoints}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, (((profile.points || 0) - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-sm">Best Time</h3>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-800">{bestTime > 0 ? formatTime(bestTime) : '--'}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Current Ao5</h3>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-800">{ao5 > 0 ? formatTime(ao5) : '--'}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Current Ao12</h3>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-800">{ao12 > 0 ? formatTime(ao12) : '--'}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sm">Current Ao100</h3>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-800">{ao100 > 0 ? formatTime(ao100) : '--'}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Performance History
        </h3>
        {solves.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="solveNumber" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}s`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(2)}s`, 'Time']}
                  labelFormatter={(label) => `Solve #${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            Complete some solves to see your performance history.
          </div>
        )}
      </div>
    </div>
  );
};
