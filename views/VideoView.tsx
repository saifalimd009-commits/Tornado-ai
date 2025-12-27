
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { GeneratedVideo } from '../types';

export const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [video, setVideo] = useState<GeneratedVideo | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Initializing neural pathways...",
    "Understanding your vision...",
    "Drafting keyframes...",
    "Synthesizing motion vectors...",
    "Applying high-res textures...",
    "Final rendering in progress..."
  ];

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % steps.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleOpenKey = async () => {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success as per instructions
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setLoadingStep(0);

    try {
      const url = await geminiService.generateVideo(prompt);
      setVideo({
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(error);
      alert("Video generation failed. Please ensure you have a valid paid project API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="glass-morphism rounded-3xl p-12 max-w-lg border border-indigo-500/20">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Unlock Video Lab</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Veo video generation requires a paid Google Cloud Project API key. 
            Please select your project to continue.
          </p>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-indigo-400 text-sm mb-6 hover:underline">
            Learn about billing →
          </a>
          <button 
            onClick={handleOpenKey}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Video Lab</h2>
        <p className="text-white/50">Create 720p cinematic sequences with Veo 3.1.</p>
      </div>

      <div className="space-y-8">
        <div className="glass-morphism rounded-3xl p-8 border border-white/10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="A drone shot flying through a glowing neon forest at night..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-lg focus:ring-2 focus:ring-indigo-500/50 resize-none h-32 outline-none transition-all"
          />
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/50">16:9 Landscape</div>
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/50">720p HD</div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 active:scale-95'
                : 'bg-white/5 text-white/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Video...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Create Scene</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          {isGenerating && (
            <div className="aspect-video glass-morphism rounded-3xl border border-indigo-500/30 flex flex-col items-center justify-center p-12 text-center overflow-hidden">
               <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
               <h3 className="text-2xl font-bold mb-2">Generating your video</h3>
               <p className="text-white/60 mb-6 max-w-md">This usually takes 1-2 minutes. Please don't close this tab.</p>
               <div className="px-6 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-medium animate-pulse">
                  {steps[loadingStep]}
               </div>
            </div>
          )}

          {video && !isGenerating && (
            <div className="glass-morphism rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <video 
                src={video.url} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video object-cover"
              />
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium italic mb-1">"{video.prompt}"</p>
                  <p className="text-white/40 text-xs">Generated {video.timestamp.toLocaleTimeString()}</p>
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = video.url;
                    link.download = `veo-video-${video.id}.mp4`;
                    link.click();
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
                >
                  Download MP4
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
