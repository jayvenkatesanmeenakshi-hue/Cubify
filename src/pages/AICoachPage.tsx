import React, { useState } from 'react';
import { Brain, Timer, Dna, Dumbbell, HeartPulse, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type AITool = 'scramble-analyzer' | 'solve-analyzer' | 'algo-recommender' | 'practice-generator' | 'mental-coach';

export function AICoachPage() {
  const [activeTool, setActiveTool] = useState<AITool>('scramble-analyzer');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tools = [
    { id: 'scramble-analyzer', name: 'Scramble Analyzer', icon: Dna, description: 'Find the best cross and x-cross solutions for a scramble.' },
    { id: 'solve-analyzer', name: 'Solve Critique', icon: Timer, description: 'Analyze your solve time and reconstruction for improvements.' },
    { id: 'algo-recommender', name: 'Algo Recommender', icon: Brain, description: 'Get fingertrick-friendly algs for specific cases.' },
    { id: 'practice-generator', name: 'Practice Routine', icon: Dumbbell, description: 'Generate a personalized speedcubing practice schedule.' },
    { id: 'mental-coach', name: 'Mental Coach', icon: HeartPulse, description: 'Advice on handling competition nerves and staying focused.' },
  ];

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResponse('');

    let prompt = '';
    switch (activeTool) {
      case 'scramble-analyzer':
        prompt = `You are an expert speedcuber. Analyze this 3x3 scramble and provide the best cross solutions (white or color neutral) and point out any x-cross opportunities. Keep it concise and use standard notation. Scramble: ${input}`;
        break;
      case 'solve-analyzer':
        prompt = `You are an expert speedcubing coach. The user has provided details about a recent solve (time, scramble, and possibly reconstruction or thoughts). Analyze it and give 3 actionable tips to improve. User input: ${input}`;
        break;
      case 'algo-recommender':
        prompt = `You are an expert speedcuber. The user is asking for algorithm recommendations for a specific case (e.g., a bad F2L case, OLL, PLL). Provide 2-3 of the best, most fingertrick-friendly modern algorithms for this case and briefly explain how to execute them. User input: ${input}`;
        break;
      case 'practice-generator':
        prompt = `You are an expert speedcubing coach. The user wants a practice routine. They have provided their current average and goals. Generate a structured, 1-hour daily practice routine tailored to their level. User input: ${input}`;
        break;
      case 'mental-coach':
        prompt = `You are a sports psychologist specializing in speedcubing. The user is asking for advice on mindset, handling competition nerves, or motivation. Provide encouraging, practical psychological advice. User input: ${input}`;
        break;
    }

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setResponse(result.text || 'No response generated.');
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("Sorry, there was an error communicating with the AI coach.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-yellow-500" />
          AI Speedcubing Coach
        </h1>
        <p className="text-slate-600">Level up your cubing with AI-powered insights and analysis.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as AITool); setResponse(''); setInput(''); }}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                isActive 
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-800' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-yellow-200 hover:bg-yellow-50/50'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-yellow-600' : 'text-slate-400'}`} />
              <span className="font-semibold text-xs sm:text-sm">{tool.name}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {tools.find(t => t.id === activeTool)?.name}
          </h2>
          <p className="text-slate-600 text-sm">
            {tools.find(t => t.id === activeTool)?.description}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {activeTool === 'scramble-analyzer' && 'Enter scramble (e.g., R U R\' U\')'}
              {activeTool === 'solve-analyzer' && 'Enter solve details (time, scramble, thoughts)'}
              {activeTool === 'algo-recommender' && 'Describe the case (e.g., V Perm, bad F2L pair)'}
              {activeTool === 'practice-generator' && 'Enter your current average and goals'}
              {activeTool === 'mental-coach' && 'What\'s on your mind? (e.g., nervous for next comp)'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all resize-none h-32 bg-slate-50"
              placeholder="Type here..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Get AI Advice
              </>
            )}
          </button>
        </div>

        {response && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-yellow-600" />
              Coach's Advice
            </h3>
            <div className="prose prose-yellow max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200">
              <Markdown>{response}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
