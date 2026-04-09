import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, BrainCircuit, Trophy, ArrowRight, Brain, Zap } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
          Professional Speedcubing <span className="text-yellow-500">Suite</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          The ultimate companion for Rubik's Cube enthusiasts. Professional timing, WCA scrambles, and AI-powered solving strategies.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/timer" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-yellow-400/20">
            Start Solving <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/coach" className="inline-flex items-center gap-2 bg-white hover:bg-yellow-50 text-slate-900 font-semibold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-sm border border-slate-200">
            Meet AI Coach <Brain className="w-5 h-5 text-yellow-600" />
          </Link>
          <Link to="/race" className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-[#00FF00] font-mono font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-500/10 border border-[#00FF00]/30">
            <Zap className="w-5 h-5" /> Race Network
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
            <Timer className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Pro Timer</h3>
          <p className="text-slate-600">Stackmat-style timer with millisecond precision, Ao5/Ao12 tracking, and local/cloud session history.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
            <BrainCircuit className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">AI Solver</h3>
          <p className="text-slate-600">Stuck on a scramble? Our AI solver generates step-by-step CFOP solutions instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -z-10" />
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
            <Brain className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">AI Coach</h3>
          <p className="text-slate-600">Get personalized practice routines, scramble analysis, and algorithm recommendations.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Track Progress</h3>
          <p className="text-slate-600">Log in to save your solves securely to the cloud and track your personal bests over time.</p>
        </div>
      </div>
    </div>
  );
};
