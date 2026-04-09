import React, { useState } from 'react';
import { solveCube } from '../lib/cube';
import { BrainCircuit, Loader2 } from 'lucide-react';

export const Solver: React.FC = () => {
  const [inputScramble, setInputScramble] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = () => {
    if (!inputScramble.trim()) return;
    
    setIsSolving(true);
    setSolution(null);
    
    // Use setTimeout to allow the UI to update with the loading state
    // before the synchronous and heavy initCubeSolver/solveCube blocks the main thread.
    setTimeout(() => {
      const result = solveCube(inputScramble);
      setSolution(result);
      setIsSolving(false);
    }, 50);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">AI Cube Solver</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input 
            type="text" 
            value={inputScramble}
            onChange={(e) => setInputScramble(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
            placeholder="Enter scramble (e.g., R U R' U')"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            disabled={isSolving}
          />
          <button 
            onClick={handleSolve}
            disabled={isSolving || !inputScramble.trim()}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center min-w-[120px]"
          >
            {isSolving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Solve'}
          </button>
        </div>

        {solution && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-2">Solution (CFOP / Kociemba):</p>
            <p className="font-mono text-lg text-yellow-700 tracking-wide leading-relaxed font-semibold">
              {solution}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
