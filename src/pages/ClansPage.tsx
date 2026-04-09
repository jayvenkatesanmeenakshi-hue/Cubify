import React, { useState, useEffect } from 'react';
import { Shield, Search, Users, Trophy, Plus, Star } from 'lucide-react';
import { db, collection, getDocs, query, orderBy, limit } from '../firebase';

export const ClansPage = () => {
  const [activeTab, setActiveTab] = useState<'my-clan' | 'find'>('my-clan');
  const [clans, setClans] = useState<any[]>([]);

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const q = query(collection(db, 'clans'), orderBy('points', 'desc'), limit(50));
        const snap = await getDocs(q);
        setClans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Error fetching clans", e);
      }
    };
    fetchClans();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-black text-slate-800">Cube Crews</h1>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5" /> Create Crew
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveTab('my-clan')}
          className={`font-bold pb-4 -mb-4 border-b-2 transition-colors ${activeTab === 'my-clan' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
        >
          My Crew
        </button>
        <button 
          onClick={() => setActiveTab('find')}
          className={`font-bold pb-4 -mb-4 border-b-2 transition-colors ${activeTab === 'find' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
        >
          Find a Crew
        </button>
      </div>

      {activeTab === 'my-clan' ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <Shield className="w-24 h-24 text-slate-200 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">You are not in a Crew</h2>
          <p className="text-slate-500 mb-8 max-w-md">Join a Crew to compete in team leaderboards, unlock exclusive chat borders, and earn bonus tournament points.</p>
          <button 
            onClick={() => setActiveTab('find')}
            className="bg-indigo-50 text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
          >
            Browse Crews
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Crew Name or Tag..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Crew Name</div>
              <div className="col-span-2 text-center">Members</div>
              <div className="col-span-2 text-center">Points</div>
              <div className="col-span-2 text-center">Action</div>
            </div>
            <div className="divide-y divide-slate-100">
              {clans.length > 0 ? clans.map((clan, index) => (
                <div key={clan.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 text-center font-bold text-slate-400">#{index + 1}</div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                      {clan.tag || 'C'}
                    </div>
                    <div className="font-bold text-slate-800">{clan.name}</div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2 text-slate-600 font-medium">
                    <Users className="w-4 h-4" /> {clan.members || 1}/50
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2 text-yellow-600 font-bold">
                    <Star className="w-4 h-4 fill-current" /> {(clan.points || 0).toLocaleString()}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  No crews found. Be the first to create one!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
