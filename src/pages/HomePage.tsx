import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, query, collection, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Edit2, Save, X, Shield, Globe, Award, Lock, ExternalLink, Activity, Info, LogOut, CheckCircle2, Cpu, Zap, Star, LayoutGrid } from 'lucide-react';
import { logout } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { broadcastActivity } from '../services/ecosystemService';

interface HomePageProps {
  user: User;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [searchParams] = useSearchParams();

  const appId = searchParams.get('app_id');
  const redirectUri = searchParams.get('redirect_uri');
  const isAuthRequest = appId && redirectUri;

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

  const handleAuthConfirm = async () => {
    if (!appId || !redirectUri) return;

    // Log the auth event
    await broadcastActivity(user.uid, `Authorized ${appId} for secure data access.`, {
      app: 'Passport',
      type: 'auth_grant',
      target_app: appId
    });

    // Generate a simulated secure token
    const secureToken = btoa(`${user.uid}:${Date.now()}:${Math.random()}`).substring(0, 32);
    
    // Redirect with the token and ID
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('passport_id', user.uid);
    callbackUrl.searchParams.set('auth_token', secureToken);
    
    window.location.href = callbackUrl.toString();
  };

  if (!profile) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">SYNCHRONIZING PASSPORT...</div>;

  const auraPoints = (profile.points || 0) + (profile.skill || 0) + (profile.knowledge || 0) + (profile.creation || 0);
  const auraLevel = Math.floor(Math.sqrt(auraPoints / 10)) || 1;

  if (isAuthRequest) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 flex items-center justify-center relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-[0_0_40px_rgba(79,70,229,0.4)] mb-8 animate-pulse">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Access Request</h1>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Protocol ID: {appId}</div>
            
            <p className="text-slate-400 leading-relaxed font-medium">
              The application <strong className="text-white">{appId}</strong> is requesting verification of your StarVortex identity. This will grant them access to your global profile and Aura level.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-lg object-cover grayscale" />
              <div className="text-left">
                <div className="text-xs font-black text-white uppercase italic">{profile.displayName}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Global Aura Lvl {auraLevel}</div>
              </div>
            </div>

            <button 
              onClick={handleAuthConfirm}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              Verify Identification
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5"
            >
              Deny Access
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <Lock className="w-2.5 h-2.5" /> End-to-end encrypted connection
          </div>
        </motion.div>
      </div>
    )
  }

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
                      Rank: {(auraLevel >= 10 ? 'ELITE' : 'INITIATE')}
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
          {/* Left Column: Ecosystem & Modules */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-8">
                <Cpu className="w-5 h-5 text-indigo-500" /> Attributes
              </h2>
              <div className="space-y-4">
                <AttributeBar label="Skill" value={profile.skill || 0} color="indigo" />
                <AttributeBar label="Knowledge" value={profile.knowledge || 0} color="emerald" />
                <AttributeBar label="Creation" value={profile.creation || 0} color="orange" />
                <AttributeBar label="Reputation" value={profile.points || 0} color="purple" />
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-8">
                <LayoutGrid className="w-5 h-5 text-purple-500" /> Achievements
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border ${i <= (profile.achievements?.length || 0) + 2 ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/5 text-slate-700'}`}>
                    <Star className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Dynamic Feed & Integration */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-500" /> Linked Nodes
                </h2>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Synchronizations</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <AppLinkCard name="Passport" description="Core Identity Node" isLinked={true} color="indigo" />
                <AppLinkCard name="GrindOS" description="Intelligence Ops" isLinked={profile.appsUsed?.includes('GrindOS')} color="blue" />
                <AppLinkCard name="FireInk" description="Creative Node" isLinked={profile.appsUsed?.includes('FireInk')} color="orange" />
                <AppLinkCard name="ExplainerX" description="Archive Module" isLinked={profile.appsUsed?.includes('ExplainerX')} color="emerald" />
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-500" /> Security Log
                  </h2>
                </div>

                <div className="space-y-4">
                  {activities.length > 0 ? activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                      <div className="mt-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-200">{activity.description}</div>
                        <div className="text-[8px] font-mono text-slate-600 mt-1 uppercase">
                          {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleTimeString() : '...'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-700 font-mono text-[10px] tracking-widest uppercase">STREAM IDLE</div>
                  )}
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-8">
                  <Lock className="w-5 h-5 text-red-500" /> Terminal
                </h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Rotate Keys</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all group"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-red-500">End Session</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttributeBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colors: any = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} transition-all duration-1000`} 
          style={{ width: `${Math.min(100, (value / 500) * 100)}%` }} 
        />
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
    <div className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden bg-slate-900/30 ${isLinked ? colorClasses[color] : 'border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-black uppercase tracking-tighter ${isLinked ? textClasses[color] : 'text-slate-400'}`}>
          {name}
        </h3>
        {isLinked ? (
          <CheckCircle2 className={`w-5 h-5 ${textClasses[color]}`} />
        ) : (
          <Lock className="w-5 h-5 text-slate-800" />
        )}
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight mb-6">{description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-widest ${isLinked ? textClasses[color] : 'text-slate-700'}`}>
          {isLinked ? 'Synchronized' : 'Offline'}
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
