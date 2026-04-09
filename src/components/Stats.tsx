import React from 'react';
import { SolveRecord } from '../types';
import { formatTime } from '../lib/utils';

interface StatsProps {
  solves: SolveRecord[];
  onDeleteSolve?: (id: string) => void;
}

export const Stats: React.FC<StatsProps> = ({ solves, onDeleteSolve }) => {
  const calculateAoN = (solvesList: SolveRecord[], n: number) => {
    if (solvesList.length < n) return null;
    const recentN = solvesList.slice(0, n).map(s => s.time);
    recentN.sort((a, b) => a - b);
    // Remove best 5% and worst 5% (standard WCA is 1 of each for Ao5, 1 of each for Ao12)
    const removeCount = Math.ceil(n * 0.05);
    const counting = recentN.slice(removeCount, n - removeCount);
    const sum = counting.reduce((a, b) => a + b, 0);
    return sum / counting.length;
  };

  const bestTime = solves.length > 0 ? Math.min(...solves.map(s => s.time)) : null;
  const currentAo5 = calculateAoN(solves, 5);
  const currentAo12 = calculateAoN(solves, 12);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div className="col-span-1 md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Session Stats</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Best Time</p>
            <p className="text-3xl font-bold text-yellow-600 font-mono">
              {bestTime ? formatTime(bestTime) : '--'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Current Ao5</p>
            <p className="text-2xl font-bold text-slate-800 font-mono">
              {currentAo5 ? formatTime(currentAo5) : '--'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Current Ao12</p>
            <p className="text-2xl font-bold text-slate-800 font-mono">
              {currentAo12 ? formatTime(currentAo12) : '--'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Solves</p>
            <p className="text-xl font-semibold text-slate-800">
              {solves.length}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Solves</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium hidden sm:table-cell">Scramble</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {solves.slice(0, 10).map((solve, index) => (
                <tr key={solve.id || index} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 text-slate-500">{solves.length - index}</td>
                  <td className="py-3 font-mono font-semibold text-slate-800">
                    {formatTime(solve.time)}
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-400 hidden sm:table-cell max-w-[200px] truncate">
                    {solve.scramble}
                  </td>
                  <td className="py-3 text-right">
                    {onDeleteSolve && solve.id && (
                      <button 
                        onClick={() => onDeleteSolve(solve.id!)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {solves.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No solves yet. Start the timer!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
