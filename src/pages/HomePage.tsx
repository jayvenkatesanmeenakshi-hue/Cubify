import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, query, collection, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Edit2, Save, X, Shield, Globe, Award, Lock, ExternalLink, Activity, Info, LogOut, CheckCircle2 } from 'lucide-react';
import { logout } from '../firebase';
import { motion } from 'motion/react';

interface HomePageProps {
  user: User;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Listen for Profile Changes
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setEditName(data.displayName || user.displayName || 'Space Voyager');
        setEditBio(data.bio || 'Exploring the StarVortex ecosystem.');
      }
    });

    // Listen for Security Logs (Activities)
    const q = query(collection(db, 'users', user.uid, 'activities'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribeActivities = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeActivities();
    };
  }, [user]);

  const handleSave = async () => {
    await setDoc(doc(db, 'users', user.uid), { 
      displayName: editName,
      bio: editBio 
    }, { merge: true });
    setIsEditing(false);
  };

  if (!profile) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">SYNCHRONIZING PASSPORT...</div>;

  const auraPoints = (profile.points || 0) + (profile.skill || 0) + (profile.knowledge || 0) + (profile.creation || 0);
  const auraLevel = Math.floor(Math.sqrt(auraPoints / 10)) || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full">
            <div className="relative">
              <img 
                src={profile.photoURL || user.photoURL || ''} 
                alt="Profile" 
                className="w-32 h-32 rounded-3xl object-cover border-2 border-white/10 shadow-2xl" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-3 -right-3 bg-indigo-600 p-2 rounded-xl shadow-lg border border-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-black bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="text-slate-400 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                  />
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all">
                      <Save className="w-4 h-4" /> Commit Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">{profile.displayName}</h1>
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-400 max-w-md font-medium leading-relaxed mb-4">{profile.bio || 'Exploring the StarVortex ecosystem.'}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      ID: {profile.friendId}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400">
                      Protocol: PASSPORT_v2
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl min-w-[200px] text-center backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Global Aura</div>
              <div className="text-5xl font-black text-white italic tracking-tighter mb-1">{auraLevel}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{auraPoints} Net Potential</div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Ecosystem Status */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-500" /> Linked Nodes
                </h2>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Synchronizations</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <AppLinkCard 
                  name="Passport" 
                  description="Core Identity & Primary Auth Node"
                  isLinked={true}
                  color="indigo"
                />
                <AppLinkCard 
                  name="GrindOS" 
                  description="Central Intelligence & Meta-Progression"
                  isLinked={profile.appsUsed?.includes('GrindOS')}
                  color="blue"
                />
                <AppLinkCard 
                  name="FireInk" 
                  description="Creative Core & Narrative Synthesis"
                  isLinked={profile.appsUsed?.includes('FireInk')}
                  color="orange"
                />
                <AppLinkCard 
                  name="ExplainerX" 
                  description="Knowledge Archive & Mental Training"
                  isLinked={profile.appsUsed?.includes('ExplainerX')}
                  color="emerald"
                />
                 <AppLinkCard 
                  name="Chronos" 
                  description="Temporal Archive & Historic Simulation"
                  isLinked={profile.appsUsed?.includes('Chronos')}
                  color="purple"
                />
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-500" /> Logged Activities
                </h2>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Stream</div>
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? activities.map(activity => (
                  <div key={activity.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5 gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-1 bg-slate-800 rounded-lg text-slate-400">
                        <Lock className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{activity.description}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                    {activity.metadata?.app && (
                      <div className="px-3 py-1 bg-slate-800/50 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        NODE: {activity.metadata.app}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-12 text-slate-600 font-mono text-sm tracking-widest">NO RECENT LOGS DETECTED</div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Security & Profile */}
          <div className="lg:col-span-4 space-y-8">
             <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-red-500" /> Security
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-black text-slate-400">Protocol Access</div>
                    <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded uppercase">Secure</div>
                  </div>
                  <div className="text-sm text-slate-500 leading-relaxed font-mono">
                    Session established from recognized orbital sector. Multi-factor encryption active.
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold">Update Encryption</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold">Passport Logs</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-between p-4 bg-red-600/10 hover:bg-red-600/20 rounded-2xl border border-red-600/20 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-bold text-red-400">Terminate Session</span>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl text-center">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase tracking-widest mb-2">Voyager Status</h2>
              <div className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                You have achieved <strong>Class II</strong> ecosystem status. Continue syncing across nodes to increase your Aura level.
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-yellow-500 w-[65%]" />
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                650 / 1000 Aura for Rank Elevation
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppLinkCard = ({ name, description, isLinked, color }: { name: string, description: string, isLinked: boolean, color: string }) => {
  const colorClasses: Record<string, string> = {
    indigo: 'border-indigo-500/20 group-hover:border-indigo-500/50 bg-indigo-500/5',
    blue: 'border-blue-500/20 group-hover:border-blue-500/50 bg-blue-500/5',
    orange: 'border-orange-500/20 group-hover:border-orange-500/50 bg-orange-500/5',
    emerald: 'border-emerald-500/20 group-hover:border-emerald-500/50 bg-emerald-500/5',
    purple: 'border-purple-500/20 group-hover:border-purple-500/50 bg-purple-500/5',
  };

  const textClasses: Record<string, string> = {
    indigo: 'text-indigo-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden bg-slate-900/30 ${isLinked ? colorClasses[color] : 'border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white/5'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-black uppercase tracking-tighter ${isLinked ? textClasses[color] : 'text-slate-400'}`}>
          {name}
        </h3>
        {isLinked ? (
          <CheckCircle2 className={`w-5 h-5 ${textClasses[color]}`} />
        ) : (
          <Lock className="w-5 h-5 text-slate-600" />
        )}
      </div>
      <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">{description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest ${isLinked ? textClasses[color] : 'text-slate-600'}`}>
          {isLinked ? 'Synchronized' : 'Node Locked'}
        </span>
        {isLinked && (
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
};
