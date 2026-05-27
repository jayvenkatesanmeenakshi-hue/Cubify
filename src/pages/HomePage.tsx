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
  const [loadingStep, setLoadingStep] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [searchParams] = useSearchParams();

  const appId = searchParams.get('app_id');
  const redirectUri = searchParams.get('redirect_uri');
  const isAuthRequest = appId && redirectUri;

  const loadingSequence = [
    "CONTACTING_CENTRAL_PASSPORT_NODE...",
    "ESTABLISHING_ENCRYPTED_HANDSHAKE...",
    "VERIFYING_AURA_REPUTATION...",
    "NODE_SYNC_COMPLETE. ACCESS_GRANTED."
  ];

  useEffect(() => {
    if (profile && !showContent) {
      const timer = setInterval(() => {
        setLoadingStep(s => {
          if (s >= loadingSequence.length - 1) {
            clearInterval(timer);
            setTimeout(() => setShowContent(true), 800);
            return s;
          }
          return s + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [profile, showContent]);

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

  if (!profile || !showContent) {
    return (
      <div className="min-h-screen bg-passport-black flex flex-col items-center justify-center p-8 font-mono relative overflow-hidden">
        <div className="absolute inset-0 scanlines opacity-30" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl w-full"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-passport-gold rounded-xl">
              <Shield className="w-8 h-8 text-passport-black" />
            </div>
            <div>
              <div className="text-passport-gold text-2xl font-thin tracking-[0.4em] uppercase italic">Passport</div>
              <div className="text-passport-gold/40 text-[10px] tracking-widest uppercase">Uncharted Grid Access Protocol</div>
            </div>
          </div>

          <div className="space-y-4">
            {loadingSequence.map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: i <= loadingStep ? 1 : 0,
                  x: i <= loadingStep ? 0 : -10 
                }}
                className={`flex items-center gap-3 text-xs tracking-[0.2em] ${i === loadingStep ? 'text-passport-gold' : 'text-passport-gold/40'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${i === loadingStep ? 'bg-passport-gold animate-pulse' : (i < loadingStep ? 'bg-passport-gold/20' : 'bg-transparent')}`} />
                {text}
              </motion.div>
            ))}
          </div>

          {loadingStep === loadingSequence.length - 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-[10px] text-passport-gold/20 tracking-widest text-center animate-pulse"
            >
              REDIRECTING_TO_CORE_IDENTITY_NODE...
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  const auraPoints = (profile.points || 0) + (profile.skill || 0) + (profile.knowledge || 0) + (profile.creation || 0);
  const auraLevel = Math.floor(Math.sqrt(auraPoints / 10)) || 1;

  if (isAuthRequest) {
    return (
      <div className="min-h-screen bg-passport-black text-slate-200 font-sans p-6 flex items-center justify-center relative overflow-hidden font-thin">
        <div className="absolute inset-0 scanlines opacity-20 z-50 pointer-events-none" />
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-passport-gold/5 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[#080808] border border-passport-gold/20 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-5 bg-passport-gold rounded-[2rem] shadow-[0_0_40px_rgba(165,158,132,0.1)] mb-8">
              <Shield className="w-10 h-10 text-passport-black" />
            </div>
            <h1 className="text-3xl font-thin text-white italic tracking-[0.2em] uppercase mb-2">Access Request</h1>
            <div className="text-[10px] font-thin text-passport-gold uppercase tracking-[0.5em] mb-6">NODE_ID: {appId}</div>
            
            <p className="text-slate-500 leading-relaxed font-thin text-sm tracking-wider">
              Verification of your StarVortex identity requested by <strong className="text-passport-gold font-thin">{appId}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-passport-black border border-passport-gold/10 rounded-2xl p-4 flex items-center gap-4">
              <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-lg object-cover grayscale" />
              <div className="text-left">
                <div className="text-xs font-thin text-white uppercase italic tracking-widest">{profile.displayName}</div>
                <div className="text-[9px] text-passport-gold font-thin uppercase tracking-[0.3em]">Aura Rating: {auraLevel}</div>
              </div>
            </div>

            <button 
              onClick={handleAuthConfirm}
              className="w-full py-4 bg-passport-gold hover:bg-passport-gold-light text-passport-black font-thin uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 text-xs font-mono"
            >
              CONFIRM_IDENTITY
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 font-thin uppercase tracking-[0.3em] rounded-2xl transition-all border border-passport-gold/10 text-xs font-mono"
            >
              DENY_ACCESS
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] font-thin text-slate-600 uppercase tracking-widest">
            <Lock className="w-2.5 h-2.5" /> End-to-end encrypted grid connection
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-passport-black text-slate-300 font-sans p-6 pb-20 font-thin overflow-x-hidden">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-50 pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section - Styled like an ID Page */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#080808] border border-passport-gold/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-passport-gold/40" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-passport-gold/20 rounded-[2rem] blur-[4px]" />
              <img 
                src={profile.photoURL || user.photoURL || ''} 
                alt="Profile" 
                className="w-32 h-32 rounded-[1.8rem] object-cover border border-passport-gold/30 relative z-10 grayscale" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-3 -right-3 bg-passport-gold p-2 rounded-xl border border-passport-black z-20">
                <Shield className="w-5 h-5 text-passport-black" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-thin bg-white/5 border border-passport-gold/20 rounded-xl px-4 py-2 w-full outline-none focus:ring-1 focus:ring-passport-gold/50 text-white tracking-tighter"
                  />
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="text-slate-400 bg-white/5 border border-passport-gold/20 rounded-xl px-4 py-2 w-full outline-none focus:ring-1 focus:ring-passport-gold/50 h-20 resize-none font-thin tracking-wider"
                  />
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-passport-gold text-passport-black px-4 py-2 rounded-lg font-thin text-[10px] tracking-widest transition-all">
                      <Save className="w-4 h-4" /> COMMIT_CHANGES
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-thin text-[10px] tracking-widest transition-all">
                      <X className="w-4 h-4" /> ABORT
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <h1 className="text-4xl font-thin text-white tracking-tighter uppercase italic">{profile.displayName}</h1>
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-passport-gold/5 hover:bg-passport-gold/10 rounded-lg text-passport-gold transition-all border border-passport-gold/20">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-500 max-w-md font-thin leading-relaxed mb-4 tracking-wide text-sm">{profile.bio || 'Exploring the StarVortex ecosystem.'}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-passport-gold/5 border border-passport-gold/20 rounded-full text-[9px] font-thin uppercase tracking-[0.3em] text-passport-gold">
                      PASS_ID: {profile.friendId}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-thin uppercase tracking-[0.3em] text-slate-500">
                      CLASS: {(auraLevel >= 10 ? 'ELITE_VOYAGER' : 'INITIATE')}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-passport-black/50 p-6 rounded-[2rem] min-w-[200px] text-center border-l border-white/5">
              <div className="text-[10px] font-thin uppercase tracking-[0.4em] text-passport-gold/40 mb-2">Global Aura</div>
              <div className="text-5xl font-thin text-passport-gold italic tracking-tighter mb-1">{auraLevel}</div>
              <div className="text-[9px] font-thin uppercase tracking-[0.3em] text-white/20">{auraPoints} Net Rating</div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Ecosystem & Modules */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-xl">
              <h2 className="text-base font-thin uppercase tracking-[0.4em] flex items-center gap-3 mb-8 text-white">
                <Cpu className="w-4 h-4 text-passport-gold" /> Attributes
              </h2>
              <div className="space-y-4">
                <AttributeBar label="Skill" value={profile.skill || 0} color="gold" />
                <AttributeBar label="Knowledge" value={profile.knowledge || 0} color="black" />
                <AttributeBar label="Creation" value={profile.creation || 0} color="gold" />
                <AttributeBar label="Reputation" value={profile.points || 0} color="black" />
              </div>
            </section>

            <section className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-xl">
              <h2 className="text-base font-thin uppercase tracking-[0.4em] flex items-center gap-3 mb-8 text-white">
                <LayoutGrid className="w-4 h-4 text-passport-gold" /> Merits
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border ${i <= (profile.achievements?.length || 0) + 2 ? 'bg-passport-gold/5 border-passport-gold/30 text-passport-gold' : 'bg-white/5 border-white/5 text-slate-800'}`}>
                    <Star className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Dynamic Feed & Integration */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-thin uppercase tracking-[0.4em] flex items-center gap-3 text-white">
                  <Globe className="w-4 h-4 text-passport-gold" /> Verified Nodes
                </h2>
                <div className="text-[10px] font-thin text-slate-600 uppercase tracking-[0.3em]">Grid Connectivity</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <AppLinkCard 
                  name="Passport" 
                  description="Central Identity Node" 
                  isLinked={true} 
                  color="gold"
                  stats={{ uptime: '99.99%', health: 'Optimal', sessions: 12 }}
                  onClick={setSelectedApp}
                />
                <AppLinkCard 
                  name="GrindOS" 
                  description="Intelligence Ops" 
                  isLinked={profile.appsUsed?.includes('GrindOS')} 
                  color="black"
                  stats={{ uptime: '94.2%', health: 'Degraded', sessions: 5 }}
                  onClick={setSelectedApp}
                />
                <AppLinkCard 
                  name="FireInk" 
                  description="Creative Node" 
                  isLinked={profile.appsUsed?.includes('FireInk')} 
                  color="gold"
                  stats={{ uptime: '98.5%', health: 'Optimal', sessions: 8 }}
                  onClick={setSelectedApp}
                />
                <AppLinkCard 
                  name="Chronos" 
                  description="Knowledge Archive" 
                  isLinked={profile.appsUsed?.includes('Chronos')} 
                  color="black"
                  stats={{ uptime: '100%', health: 'Optimal', sessions: 3 }}
                  onClick={setSelectedApp}
                />
                <AppLinkCard 
                  name="AuraSync" 
                  description="Reputation Engine" 
                  isLinked={profile.appsUsed?.includes('AuraSync')} 
                  color="gold"
                  stats={{ uptime: '97.1%', health: 'Optimal', sessions: 14 }}
                  onClick={setSelectedApp}
                />
                <AppLinkCard 
                  name="Zenith" 
                  description="Elite Protocol" 
                  isLinked={profile.appsUsed?.includes('Zenith')} 
                  color="black"
                  stats={{ uptime: '88.9%', health: 'Intermittent', sessions: 2 }}
                  onClick={setSelectedApp}
                />
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-thin uppercase tracking-[0.4em] flex items-center gap-3 text-white">
                    <Activity className="w-4 h-4 text-passport-gold" /> Audit Log
                  </h2>
                </div>

                <div className="space-y-4">
                  {activities.length > 0 ? activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="mt-1">
                        <Lock className="w-3 h-3 text-passport-gold" />
                      </div>
                      <div>
                        <div className="text-[10px] font-thin text-slate-300 tracking-wider transition-all">{activity.description}</div>
                        <div className="text-[8px] font-mono text-slate-600 mt-1 uppercase tracking-widest">
                          {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleTimeString() : '...'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-700 font-mono text-[9px] tracking-widest uppercase">LOGS_IDLE</div>
                  )}
                </div>
              </section>

              <section className="bg-[#080808] border border-white/10 p-8 rounded-[2rem] shadow-xl">
                <h2 className="text-base font-thin uppercase tracking-[0.4em] flex items-center gap-3 mb-8 text-white">
                  <Lock className="w-4 h-4 text-passport-gold" /> Session
                </h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                    <Cpu className="w-4 h-4 text-passport-gold" />
                    <span className="text-xs font-thin uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Reset Protocol</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                  >
                    <LogOut className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-thin uppercase tracking-widest text-slate-600 group-hover:text-white transition-colors">Exit Passport</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-passport-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#080808] border border-passport-gold/30 rounded-[2.5rem] p-10 max-w-lg w-full relative z-[110] shadow-2xl font-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-passport-gold rounded-2xl">
                    <Shield className="w-6 h-6 text-passport-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-white uppercase italic tracking-tighter">{selectedApp.name}</h2>
                    <div className="text-[10px] text-passport-gold uppercase tracking-[0.4em]">{selectedApp.description}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1">NODE_UPTIME</div>
                  <div className="text-xl text-passport-gold font-technical">{selectedApp.stats?.uptime || '0.00%'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1">HEALTH_STATUS</div>
                  <div className="text-xl text-white font-technical">{selectedApp.stats?.health || 'OFFLINE'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1">SYNC_SESSIONS</div>
                  <div className="text-xl text-white font-technical">{selectedApp.stats?.sessions || 0}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1">LATENCY_MS</div>
                  <div className="text-xl text-white font-technical">~24ms</div>
                </div>
              </div>

              <div className="bg-passport-gold/5 border border-passport-gold/20 p-6 rounded-2xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-4 h-4 text-passport-gold" />
                  <span className="text-[10px] text-passport-gold uppercase tracking-widest">Real-time Telemetry</span>
                </div>
                <div className="h-24 flex items-end gap-1 px-2">
                  {[40, 70, 45, 90, 65, 80, 50, 40, 60, 85, 30, 50, 70, 60, 40].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                      className="flex-1 bg-passport-gold/20 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedApp(null)}
                className="w-full py-4 bg-passport-gold text-passport-black uppercase tracking-[0.3em] font-technical text-xs rounded-2xl hover:bg-passport-gold-light transition-all"
              >
                DISMISS_INTELLIGENCE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AttributeBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colors: any = {
    gold: 'bg-passport-gold',
    black: 'bg-passport-gold/40',
  };
  return (
    <div className="space-y-2 font-thin">
      <div className="flex justify-between text-[9px] uppercase tracking-[0.2em]">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color] || 'bg-passport-gold'} transition-all duration-1000`} 
          style={{ width: `${Math.min(100, (value / 500) * 100)}%` }} 
        />
      </div>
    </div>
  );
};

const AppLinkCard = ({ name, description, isLinked, color, stats, onClick }: { name: string, description: string, isLinked: boolean, color: string, stats?: any, onClick?: (app: any) => void }) => {
  const colorClasses: Record<string, string> = {
    gold: 'border-passport-gold/30 bg-passport-gold/[0.03] hover:bg-passport-gold/[0.06]',
    black: 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]',
  };

  const textClasses: Record<string, string> = {
    gold: 'text-passport-gold',
    black: 'text-white',
  };

  return (
    <div 
      onClick={() => isLinked && onClick && onClick({ name, description, stats })}
      className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden font-thin ${isLinked ? colorClasses[color] || colorClasses.gold : 'border-white/[0.02] bg-transparent grayscale opacity-20 cursor-not-allowed'} ${isLinked ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-thin uppercase tracking-widest ${isLinked ? textClasses[color] || textClasses.gold : 'text-slate-500'}`}>
          {name}
        </h3>
        {isLinked ? (
          <CheckCircle2 className={`w-4 h-4 ${textClasses[color] || textClasses.gold}`} />
        ) : (
          <Lock className="w-4 h-4 text-slate-800" />
        )}
      </div>
      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-6">{description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[8px] uppercase tracking-widest ${isLinked ? textClasses[color] || textClasses.gold : 'text-slate-800'}`}>
          {isLinked ? 'LINKED' : 'OFFLINE'}
        </span>
        {isLinked && (
          <div className="p-2 bg-white/5 group-hover:bg-passport-gold group-hover:text-passport-black rounded-lg transition-all border border-white/5">
            <Info className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};
