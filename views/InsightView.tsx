
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { GroundingSource } from '../types';

export const InsightView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const data = await geminiService.searchGrounding(query);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to get insight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4 gradient-text">Insight Hub</h2>
        <p className="text-white/50 text-lg">Fast, grounded answers powered by Google Search.</p>
      </div>

      <div className="relative mb-12">
        <div className="flex items-center glass-morphism border border-white/10 rounded-3xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-all overflow-hidden">
          <div className="pl-6 pr-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask about current events, facts, or news..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white py-4 text-xl outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className={`px-8 py-4 rounded-2xl font-bold transition-all mr-2 ${
              query.trim() && !isLoading 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white/5 text-white/20'
            }`}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-8 pb-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-indigo-400 font-medium animate-pulse">Grounding answer with real-time data...</p>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass-morphism border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap">{result.text}</p>
              </div>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">Sources & Citations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 glass-morphism border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-white/90 font-medium truncate">{source.title}</p>
                        <p className="text-white/30 text-xs truncate">{source.uri}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
