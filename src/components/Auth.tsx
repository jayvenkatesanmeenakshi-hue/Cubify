import React from 'react';
import { loginWithGoogle, logout } from '../firebase';
import { User } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';

interface AuthProps {
  user: User | null;
}

export const Auth: React.FC<AuthProps> = ({ user }) => {
  return (
    <div className="flex items-center w-full">
      {user ? (
        <div className="flex items-center justify-between w-full gap-3 bg-slate-50 px-3 py-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden">
            {user.photoURL && (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            )}
            <span className="text-sm font-medium text-slate-700 truncate">
              {user.displayName?.split(' ')[0]}
            </span>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button 
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-3 rounded-xl shadow-sm text-slate-900 font-bold transition-all hover:shadow-md w-full"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      )}
    </div>
  );
};
