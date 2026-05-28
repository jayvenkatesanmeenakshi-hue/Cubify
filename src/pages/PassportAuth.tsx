import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowRight, ExternalLink } from 'lucide-react';

export const PassportAuth = ({ user, forcedClientId }: { user: any, forcedClientId?: string }) => {
  const [searchParams] = useSearchParams();
  const rawClientId = forcedClientId || searchParams.get('client_id') || 'Unknown Alpha';
  const redirectUri = searchParams.get('redirect_uri') || (rawClientId !== 'Unknown Alpha' ? `https://${rawClientId.toLowerCase()}.starvortexai.com/passport-login-success` : null);

  // Clean the client ID for display (strip protocol/domain if present)
  const displayClientId = rawClientId
    .replace(/^https?:\/\//, '')
    .split('.')[0]
    .toUpperCase();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAuthorize = async () => {
    if (!user || !redirectUri || loading) return;
    setLoading(true);
    setError(null);

    try {
      console.log('Initiating handshake for:', rawClientId);
      
      // Fetch a real Firebase custom token from our server
      const response = await fetch('/api/auth/custom-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Handshake negotiation failed');
      }
      
      const { customToken } = await response.json();
      
      if (!customToken) throw new Error('No token received from nebula');
      
      const url = new URL(redirectUri);
      url.searchParams.append('passport_id', user.uid);
      url.searchParams.append('auth_token', customToken);

      console.log('Handshake successful, redirecting to:', url.origin);
      
      // Perform redirect
      window.location.href = url.toString();
    } catch (err: any) {
      console.error('Handshake failed:', err);
      setError(err.message || 'Unknown protocol error');
      setLoading(false);
    }
  };

  if (!user) {
    // If user isn't logged in, redirect to landing with the right parameters to preserve context
    const landingUrl = new URL(window.location.origin);
    landingUrl.searchParams.set('app_id', rawClientId);
    if (redirectUri) landingUrl.searchParams.set('redirect_uri', redirectUri);
    
    return (
      <div className="min-h-screen bg-passport-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0c0c0c] to-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#080808] border border-passport-gold/20 p-10 rounded-[2.5rem] text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-passport-gold/10 rounded-2xl border border-passport-gold/20">
              <Lock className="w-8 h-8 text-passport-gold" />
            </div>
          </div>
          <h2 className="text-2xl text-white uppercase italic tracking-tighter mb-2">Identity Verification</h2>
          <p className="text-slate-500 font-thin text-xs leading-relaxed uppercase tracking-widest mb-8">
            Please authenticate your Passport to continue to <span className="text-passport-gold">{displayClientId}</span>.
          </p>
          <button 
            onClick={() => window.location.href = landingUrl.toString()}
            className="w-full py-4 bg-passport-gold text-passport-black uppercase tracking-[0.3em] font-technical text-xs rounded-2xl hover:bg-white hover:text-black transition-all"
          >
            SECURE_LOGIN_REQUIRED
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-passport-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0c0c0c] to-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-[#080808] border border-passport-gold/30 p-10 rounded-[2.5rem] relative shadow-2xl overflow-hidden font-thin"
      >
        {/* Visual accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-passport-gold/5 blur-3xl -mr-16 -mt-16" />
        
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-passport-gold rounded-2xl">
            <Shield className="w-6 h-6 text-passport-black" />
          </div>
          <div>
            <h1 className="text-xl text-white uppercase italic tracking-tighter">Passport Authorization</h1>
            <div className="text-[10px] text-passport-gold uppercase tracking-[0.4em]">Secure Handshake Protocol</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-8 rounded-3xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-passport-gold/40 flex items-center justify-center mb-2">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} alt="" className="w-10 h-10 rounded-full grayscale" />
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Passport</span>
            </div>
            <ArrowRight className="w-5 h-5 text-passport-gold/30" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-passport-gold/10 border border-passport-gold/20 flex items-center justify-center mb-2">
                <ExternalLink className="w-5 h-5 text-passport-gold" />
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">{displayClientId}</span>
            </div>
          </div>
          
          <p className="text-slate-300 text-xs leading-relaxed text-center mb-0">
            Node <span className="text-passport-gold italic uppercase">{displayClientId}</span> is requesting access to your Neural Identity.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest">
            <div className="w-1 h-1 bg-passport-gold rounded-full" />
            Basic Identity (Display Name, Aura)
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest">
            <div className="w-1 h-1 bg-passport-gold rounded-full" />
            Unique Passport ID Verification
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest">
            <div className="w-1 h-1 bg-passport-gold rounded-full" />
            Cross-node Rank Synchronization
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase tracking-widest text-center">
              Protocol Error: {error}
            </div>
          )}
          <button 
            onClick={handleAuthorize}
            disabled={loading}
            className="w-full py-5 bg-passport-gold text-passport-black uppercase tracking-[0.4em] font-technical text-xs rounded-2xl hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(165,158,132,0.2)] disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? 'NEGOTIATING_HANDSHAKE...' : `Login to ${displayClientId}`}
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 text-slate-500 uppercase tracking-[0.3em] font-technical text-[10px] hover:text-white transition-all"
          >
            Cancel Handshake
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-technical uppercase">
            Encrypted Session: {btoa(user.uid).substring(0, 12)}...
          </div>
        </div>
      </motion.div>
    </div>
  );
};
