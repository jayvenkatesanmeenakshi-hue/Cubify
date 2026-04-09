import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Timer } from '../components/Timer';
import { Scrambler } from '../components/Scrambler';
import { Stats } from '../components/Stats';
import { SolveRecord, PuzzleType } from '../types';
import { RefreshCw, Bluetooth, BluetoothConnected, Flame } from 'lucide-react';

interface TimerPageProps {
  scramble: string;
  solves: SolveRecord[];
  onSolveComplete: (time: number) => void;
  onDeleteSolve: (id: string) => void;
  onResetSession: () => void;
  puzzle: PuzzleType;
  onPuzzleChange: (puzzle: PuzzleType) => void;
}

export const TimerPage: React.FC<TimerPageProps> = ({ scramble, solves, onSolveComplete, onDeleteSolve, onResetSession, puzzle, onPuzzleChange }) => {
  const location = useLocation();
  const isTournament = new URLSearchParams(location.search).get('mode') === 'tournament';
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  const handleBluetoothConnect = async () => {
    try {
      if (!navigator.bluetooth) {
        alert("Web Bluetooth is not supported in this browser.");
        return;
      }
      // Request any bluetooth device for now as a mock
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      if (device) {
        setIsBluetoothConnected(true);
        alert(`Connected to ${device.name || 'Smart Cube'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          Timer
          {isTournament && (
            <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4" /> Tournament Match
            </span>
          )}
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBluetoothConnect}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors border ${isBluetoothConnected ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {isBluetoothConnected ? <BluetoothConnected className="w-4 h-4" /> : <Bluetooth className="w-4 h-4" />}
            {isBluetoothConnected ? 'Cube Connected' : 'Connect Smart Cube'}
          </button>
          <select 
            value={puzzle}
            onChange={(e) => onPuzzleChange(e.target.value as PuzzleType)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 shadow-sm outline-none font-medium"
          >
            <option value="2x2">2x2 Cube</option>
            <option value="3x3">3x3 Cube</option>
            <option value="4x4">4x4 Cube</option>
            <option value="Pyraminx">Pyraminx</option>
          </select>
        </div>
      </header>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 mb-8 relative overflow-hidden">
        <Scrambler scramble={scramble} />
        <Timer onSolveComplete={onSolveComplete} />
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={onResetSession}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full shadow-sm transition-all border border-slate-200"
            title="Reset Session / New Scramble"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      <Stats solves={solves} onDeleteSolve={onDeleteSolve} />
    </div>
  );
};
