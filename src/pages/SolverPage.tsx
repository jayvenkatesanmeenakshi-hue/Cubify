import React from 'react';
import { Solver } from '../components/Solver';

export const SolverPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">AI Cube Solver</h2>
        <p className="text-slate-600">Enter your scramble below to get a step-by-step CFOP solution.</p>
      </div>
      <Solver />
    </div>
  );
};
