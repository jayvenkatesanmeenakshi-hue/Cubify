import React from 'react';

interface ScramblerProps {
  scramble: string;
}

export const Scrambler: React.FC<ScramblerProps> = ({ scramble }) => {
  return (
    <div className="w-full py-6 px-4 text-center">
      <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-wide font-mono">
        {scramble || "Generating scramble..."}
      </h2>
    </div>
  );
};
