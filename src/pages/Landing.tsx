import React, { useState } from 'react';
import { LogIn, Shield, ShieldCheck, Zap, Globe, Sparkles, Lock, Terminal } from 'lucide-react';
import { loginWithPassword } from '../firebase';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

export const Landing = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app_id');
  const redirectUri = searchParams.get('redirect_uri');
  const isAuthRequest = appId && redirectUri;

  const [id, setId] = useState('');
  const [key, setKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !key) return;
    setIsVerifying(true);
    // Transform ID into a pseudo-email if not provided as one
    const email = id.includes('@') ? id : `${id}@passport.grid`;
    await loginWithPassword(email, key);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-passport-black font-sans text-slate-100 overflow-hidden relative selection:bg-passport-gold/30 font-thin">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-40 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      
      {/* Official Background Texture */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-passport-gold/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-passport-gold-light/5 blur-[120px] rounded-full animate-pulse opacity-30" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 px-8 py-4 flex justify-between items-center border-b border-passport-gold/10 backdrop-blur-sm max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-passport-gold rounded-lg shadow-[0_0_20px_rgba(165,158,132,0.1)]">
            <Shield className="w-5 h-5 text-passport-black" />
          </div>
          <span className="text-xl font-thin tracking-[0.4em] text-passport-gold uppercase italic">
            Passport
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[9px] font-mono text-passport-gold/40 tracking-[0.3em] hidden sm:block">
            HANDSHAKE_PENDING
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl"
        >
          {isAuthRequest ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-passport-gold/5 text-passport-gold-light text-xs font-thin mb-8 border border-passport-gold/30 uppercase tracking-[0.5em] animate-pulse"
            >
              <Lock className="w-4 h-4 text-passport-gold" />
              INBOUND_HANDSHAKE: {appId}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-passport-gold-light text-[10px] font-thin mb-8 border border-passport-gold/10 uppercase tracking-[0.6em]"
            >
              <Zap className="w-3.5 h-3.5" />
              GRID_PROTOCOL_V2_ACTIVE
            </motion.div>
          )}

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            className="text-6xl md:text-8xl font-thin tracking-tighter text-white mb-8 leading-[0.85]"
          >
            Access Secured.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-passport-gold to-passport-gold-light italic">
              Aura Verified.
            </span>
          </motion.h1>
          
          <div className="text-sm md:text-base text-slate-500 mb-12 max-w-2xl mx-auto font-thin leading-relaxed tracking-[0.1em]">
            {isAuthRequest ? (
              <motion.p
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.12, delayChildren: 2 }
                  }
                }}
              >
                {"To authenticate with this node, a secure session must be established. The StarVortex Passport ensures your Identity remains decoupled from centralized surveillance while maintaining total cross-sync integrity within the uncharted grid.".split(" ").map((word, i) => (
                  <motion.span key={i} variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} className="inline-block mr-1">
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            ) : (
              <motion.p
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.12, delayChildren: 2 }
                  }
                }}
              >
                {"The StarVortex Passport is your encrypted key to the uncharted grid. It protects your Aura from centralized surveillance while granting you access to specialized nodes. Your reputation is your only true asset in the void. Guard it.".split(" ").map((word, i) => (
                  <motion.span key={i} variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} className="inline-block mr-1">
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 9 }}
            className="w-full max-w-sm mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal className="w-4 h-4 text-passport-gold/40" />
                </div>
                <input 
                  type="text"
                  placeholder="GRID_IDENTIFIER"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-white/5 border border-passport-gold/20 rounded-xl py-4 pl-12 pr-4 text-xs font-mono tracking-widest text-passport-gold placeholder:text-passport-gold/20 focus:outline-none focus:border-passport-gold/50 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-passport-gold/40" />
                </div>
                <input 
                  type="password"
                  placeholder="SECURE_HANDSHAKE_KEY"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-white/5 border border-passport-gold/20 rounded-xl py-4 pl-12 pr-4 text-xs font-mono tracking-widest text-passport-gold placeholder:text-passport-gold/20 focus:outline-none focus:border-passport-gold/50 transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-3 bg-passport-gold hover:bg-passport-gold-light text-passport-black font-thin py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_40px_rgba(165,158,132,0.1)] text-xs uppercase tracking-[0.4em] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'VERIFYING_CREDENTIALS...' : 'ESTABLISH_PASSPORT_LINK'} 
                {!isVerifying && <LogIn className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Security / Ecosystem Indicators */}
        <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <SecurityMetric 
            icon={<ShieldCheck className="w-5 h-5 text-passport-gold" />}
            label="Security Rating"
            value="Class Alpha"
          />
          <SecurityMetric 
            icon={<Globe className="w-5 h-5 text-passport-gold" />}
            label="Node Connectivity"
            value="Active Sync"
          />
          <SecurityMetric 
            icon={<Sparkles className="w-5 h-5 text-passport-gold" />}
            label="Aura Protocol"
            value="Initialized"
          />
          <SecurityMetric 
            icon={<Zap className="w-5 h-5 text-passport-gold" />}
            label="Response Latency"
            value="0.002ms"
          />
        </div>

        {/* Login with Passport Demo / Feature Section */}
        <div className="mt-40 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">The Ecosystem Gateway</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Passport doesn't just manage your password. It centralizes your entire digital presence. Your achievements in <strong>FireInk</strong>, your skills in <strong>Cubify</strong>, and your knowledge in <strong>ExplainerX</strong> all flow through your Passport.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-passport-gold/20 flex items-center justify-center mt-1 border border-passport-gold/30">
                    <div className="w-2 h-2 rounded-full bg-passport-gold" />
                  </div>
                  <span className="text-slate-300">Biometric and Google-backed OAuth security.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-passport-gold/20 flex items-center justify-center mt-1 border border-passport-gold/30">
                    <div className="w-2 h-2 rounded-full bg-passport-gold" />
                  </div>
                  <span className="text-slate-300">Universal 'Aura' score tracks your global reputation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-passport-gold/20 flex items-center justify-center mt-1 border border-passport-gold/30">
                    <div className="w-2 h-2 rounded-full bg-passport-gold" />
                  </div>
                  <span className="text-slate-300">Zero-friction authentication for all StarVortex nodes.</span>
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-passport-gold/5 blur-[100px] rounded-full" />
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl relative z-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-passport-black border border-passport-gold/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-passport-gold" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-passport-gold/60 uppercase tracking-widest">Protocol Check</div>
                    <div className="text-white font-bold">Passport v2.10.4</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-black/60 border border-passport-gold/20 rounded-xl flex items-center px-4 text-passport-gold/40 font-mono text-sm tracking-widest">
                    AUTH_KEY: ****************
                  </div>
                  <div className="h-12 bg-black/60 border border-passport-gold/20 rounded-xl flex items-center px-4 text-passport-gold/40 font-mono text-sm tracking-widest">
                    SYNC_STATUS: ENCRYPTED
                  </div>
                  <button className="w-full bg-passport-gold py-4 rounded-xl text-passport-black font-black uppercase tracking-wider shadow-lg shadow-passport-gold/10">
                    Confirm Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SecurityMetric = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-white/10 transition-all font-thin">
    <div className="mb-4 p-2.5 bg-slate-900 rounded-xl border border-white/5">
      {icon}
    </div>
    <div className="text-[10px] font-thin uppercase tracking-[0.4em] text-slate-500 mb-1">{label}</div>
    <div className="text-white font-thin font-mono tracking-widest text-xs uppercase">{value}</div>
  </div>
);
