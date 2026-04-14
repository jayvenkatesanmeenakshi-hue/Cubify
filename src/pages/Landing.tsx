import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, BrainCircuit, Trophy, ArrowRight, Brain, Zap, Dumbbell, Shield, LogIn } from 'lucide-react';
import { loginWithGoogle } from '../firebase';
import { motion } from 'motion/react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Cubify
          </span>
        </div>
        <div>
          <button 
            onClick={loginWithGoogle}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              The Next Generation Speedcubing Platform
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
              Master the Cube.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                Precision Timing.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
              Professional timing, WCA scrambles, algorithm training, and AI-powered insights to help you break your personal bests.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={loginWithGoogle}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-xl shadow-yellow-400/20 text-lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <Link 
                to="/timer" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-4 px-8 rounded-full transition-all border border-slate-200 shadow-sm text-lg"
              >
                Try the Timer
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Timer className="w-6 h-6 text-blue-600" />}
            title="Professional Timer"
            description="Stackmat-style timer with millisecond precision, WCA scrambles for all official puzzles, and detailed Ao5/Ao12 tracking."
            color="bg-blue-50"
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-purple-600" />}
            title="AI Coach"
            description="Stuck at a barrier? Our AI analyzes your times, suggests practice routines, and helps you break through your plateaus."
            color="bg-purple-50"
          />
          <FeatureCard 
            icon={<Dumbbell className="w-6 h-6 text-green-600" />}
            title="Algorithm Trainer"
            description="Master OLL and PLL with our dedicated trainer. Practice specific cases until they become muscle memory."
            color="bg-green-50"
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6 text-yellow-600" />}
            title="Global Tournaments"
            description="Compete in daily and weekly tournaments against cubers worldwide. Climb the leaderboards and earn points."
            color="bg-yellow-50"
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-red-600" />}
            title="Cube Crews"
            description="Form clans with your friends. Compete together, share algorithms, and chat in your private crew space."
            color="bg-red-50"
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-indigo-600" />}
            title="Smart Solver"
            description="Input any scramble and our AI will generate a step-by-step CFOP solution to help you understand optimal cross and F2L."
            color="bg-indigo-50"
          />
        </div>

        {/* Social Proof / Footer CTA */}
        <div className="mt-32 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/20 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to drop your times?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join the community of cubers using Cubify to practice smarter, not just harder.
            </p>
            <button 
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 px-10 rounded-full transition-all hover:scale-105 shadow-xl shadow-yellow-400/20 text-lg"
            >
              Join Cubify Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);
