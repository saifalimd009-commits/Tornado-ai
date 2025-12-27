
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { GeneratedImage } from '../types';

export const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await geminiService.generateImage(prompt, aspectRatio);
      if (url) {
        setImages(prev => [{
          id: Date.now().toString(),
          url,
          prompt,
          timestamp: new Date()
        }, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Image generation failed', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Image Forge</h2>
        <p className="text-white/50">Describe your vision and let Gemini bring it to life.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism rounded-3xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-white/70 mb-3 uppercase tracking-wider">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset with purple skies..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500/50 resize-none h-40 outline-none transition-all"
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-white/70 mb-3 uppercase tracking-wider">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(["1:1", "4:3", "3:4", "16:9", "9:16"] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border ${
                      aspectRatio === ratio 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 active:scale-95'
                : 'bg-white/5 text-white/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Forging...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Masterpiece</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {images.length === 0 && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center glass-morphism rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white/50 mb-2">No images generated yet</h3>
              <p className="text-white/30 max-w-sm">Enter a prompt on the left to start creating high-quality AI images.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isGenerating && (
                <div className="aspect-square glass-morphism rounded-3xl border border-indigo-500/20 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-medium text-indigo-400">Rendering details...</p>
                </div>
              )}
              {images.map(img => (
                <div key={img.id} className="group relative glass-morphism rounded-3xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all">
                  <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-sm text-white line-clamp-2 mb-4 italic">"{img.prompt}"</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                           const link = document.createElement('a');
                           link.href = img.url;
                           link.download = `lumina-${img.id}.png`;
                           link.click();
                        }}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
