import React from 'react';
import { LogIn, Shield, ShieldCheck, Zap, Globe, Sparkles, Lock } from 'lucide-react';
import { loginWithGoogle } from '../firebase';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

export const Landing = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app_id');
  const redirectUri = searchParams.get('redirect_uri');
  const isAuthRequest = appId && redirectUri;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse opacity-50" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Passport
          </span>
        </div>
        <div>
          <button 
            onClick={loginWithGoogle}
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-lg font-medium transition-all border border-white/10 hover:border-white/20 backdrop-blur-md"
          >
            <LogIn className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            Establish Origin
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {isAuthRequest ? (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600/20 text-indigo-300 text-sm font-black mb-8 border border-indigo-500/30 uppercase tracking-[0.2em] animate-bounce">
              <Lock className="w-4 h-4 text-indigo-400" />
              Auth Request from {appId}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold mb-8 border border-indigo-500/20 uppercase tracking-[0.2em]">
              <Zap className="w-3.5 h-3.5" />
              Ecosystem V2 Protocol Active
            </div>
          )}

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.85]">
            One Identity.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 italic">
              Infinite Access.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            {isAuthRequest 
              ? `You must establish a secure session to authenticate with ${appId}. Connect your StarVortex Passport to proceed with node synchronization.`
              : "StarVortex Passport is your high-security gateway to the neural lattice. Connect your Aura, manage your assets, and authenticate across every node in the grid."}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={loginWithGoogle}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-10 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(79,70,229,0.4)] text-lg uppercase tracking-wider"
            >
              Initialize Passport <LogIn className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Security / Ecosystem Indicators */}
        <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <SecurityMetric 
            icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
            label="Security Rating"
            value="Class Alpha"
          />
          <SecurityMetric 
            icon={<Globe className="w-5 h-5 text-purple-400" />}
            label="Node Connectivity"
            value="Active Sync"
          />
          <SecurityMetric 
            icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
            label="Aura Protocol"
            value="Initialized"
          />
          <SecurityMetric 
            icon={<Zap className="w-5 h-5 text-orange-400" />}
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
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center mt-1 border border-indigo-500/30">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-slate-300">Biometric and Google-backed OAuth security.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center mt-1 border border-indigo-500/30">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-slate-300">Universal 'Aura' score tracks your global reputation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center mt-1 border border-indigo-500/30">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-slate-300">Zero-friction authentication for all StarVortex nodes.</span>
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl relative z-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Protocol Check</div>
                    <div className="text-white font-bold">Passport v2.10.4</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center px-4 text-slate-500 font-mono text-sm tracking-widest">
                    AUTH_KEY: ****************
                  </div>
                  <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center px-4 text-slate-500 font-mono text-sm tracking-widest">
                    SYNC_STATUS: ENCRYPTED
                  </div>
                  <button className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black uppercase tracking-wider shadow-lg">
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
  <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-white/10 transition-all">
    <div className="mb-4 p-2.5 bg-slate-900 rounded-xl border border-white/5">
      {icon}
    </div>
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
    <div className="text-white font-bold font-mono tracking-tighter">{value}</div>
  </div>
);
