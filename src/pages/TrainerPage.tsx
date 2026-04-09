import React, { useState } from 'react';
import { Brain, Shuffle, CheckCircle, XCircle } from 'lucide-react';

const OLL_ALGS = [
  { id: 1, name: 'OLL 1', alg: "R U2 R2' F R F' U2 R' F R F'", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=oll&case=R U2 R2 F R F U2 R F R F' },
  { id: 2, name: 'OLL 2', alg: "r U r' U2 r U2 R' U2 R U' r'", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=oll&case=r U r U2 r U2 R U2 R U r' },
  { id: 21, name: 'OLL 21 (Cross)', alg: "R U2 R' U' R U R' U' R U' R'", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=oll&case=R U2 R U R U R U R U R' },
];

const PLL_ALGS = [
  { id: 'Aa', name: 'Aa Perm', alg: "x L2 D2 L' U' L D2 L' U L' x'", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=pll&case=x L2 D2 L U L D2 L U L x' },
  { id: 'T', name: 'T Perm', alg: "R U R' U' R' F R2 U' R' U' R U R' F'", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=pll&case=R U R U R F R2 U R U R U R F' },
  { id: 'Ua', name: 'Ua Perm', alg: "M2 U M U2 M' U M2", img: 'https://cubing.net/api/visualcube/?fmt=svg&size=150&view=plan&bg=t&stage=pll&case=M2 U M U2 M U M2' },
];

export const TrainerPage = () => {
  const [activeSet, setActiveSet] = useState<'OLL' | 'PLL'>('OLL');
  const [currentAlg, setCurrentAlg] = useState(OLL_ALGS[0]);
  const [showAlg, setShowAlg] = useState(false);

  const nextAlg = () => {
    const set = activeSet === 'OLL' ? OLL_ALGS : PLL_ALGS;
    const randomAlg = set[Math.floor(Math.random() * set.length)];
    setCurrentAlg(randomAlg);
    setShowAlg(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-black text-slate-800">Algorithm Trainer</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setActiveSet('OLL'); setCurrentAlg(OLL_ALGS[0]); setShowAlg(false); }}
          className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeSet === 'OLL' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          OLL Trainer
        </button>
        <button 
          onClick={() => { setActiveSet('PLL'); setCurrentAlg(PLL_ALGS[0]); setShowAlg(false); }}
          className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeSet === 'PLL' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          PLL Trainer
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">{currentAlg.name}</h2>
        
        <div className="w-64 h-64 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mb-12 p-4">
          <img src={currentAlg.img} alt={currentAlg.name} className="w-full h-full object-contain" />
        </div>

        <div className="h-24 flex items-center justify-center mb-8 w-full max-w-lg">
          {showAlg ? (
            <div className="text-3xl font-mono font-bold text-slate-800 text-center tracking-wider">
              {currentAlg.alg}
            </div>
          ) : (
            <button 
              onClick={() => setShowAlg(true)}
              className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Show Algorithm
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={nextAlg}
            className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Failed
          </button>
          <button 
            onClick={nextAlg}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Solved
          </button>
        </div>
      </div>
    </div>
  );
};
