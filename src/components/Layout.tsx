import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Timer as TimerIcon, BrainCircuit, Brain, Menu, X, Zap, MessageCircle, Trophy, Dumbbell, Shield } from 'lucide-react';
import { Auth } from './Auth';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User | null;
}

export const Layout: React.FC<LayoutProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/timer', icon: TimerIcon, label: 'Timer' },
    { path: '/trainer', icon: Dumbbell, label: 'Alg Trainer' },
    { path: '/solver', icon: BrainCircuit, label: 'AI Solver' },
    { path: '/coach', icon: Brain, label: 'AI Coach' },
    { path: '/tournament', icon: Trophy, label: 'Tournament' },
    { path: '/clans', icon: Shield, label: 'Cube Crews' },
    { path: '/social', icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <div className="flex h-screen bg-yellow-50/30 overflow-hidden font-sans text-slate-900">
      {/* Mobile Header */}
      {user && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4">
          <span className="text-xl font-black text-slate-800">Cubify<span className="text-yellow-500">AI</span></span>
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Sidebar - Only show if user is logged in */}
      {user && (
        <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 hidden md:flex">
            <span className="text-2xl font-black text-slate-800">Cubify<span className="text-yellow-500">AI</span></span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 mt-16 md:mt-0 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-yellow-100 text-yellow-800 font-semibold' : 'text-slate-600 hover:bg-yellow-50 hover:text-slate-900 font-medium'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <Auth user={user} />
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && user && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${user ? 'pt-16 md:pt-0' : 'pt-0'} relative`}>
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-100/40 to-transparent -z-10" />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
