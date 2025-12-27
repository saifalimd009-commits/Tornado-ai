
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, encode } from '../services/gemini';

export const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const aiRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const transcriptionRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      aiRef.current = ai;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextsRef.current?.output;
              if (ctx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            }

            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
               transcriptionRef.current = [...transcriptionRef.current, `Lumina: ${message.serverContent.outputTranscription.text}`];
               setTranscription([...transcriptionRef.current]);
            } else if (message.serverContent?.inputTranscription) {
               transcriptionRef.current = [...transcriptionRef.current, `You: ${message.serverContent.inputTranscription.text}`];
               setTranscription([...transcriptionRef.current]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live Error', e),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are Lumina, a friendly voice assistant. Keep responses concise and engaging for real-time talk.'
        }
      });
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      alert('Microphone access denied or connection failed.');
    }
  };

  const stopSession = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
    }
    audioContextsRef.current?.input.close();
    audioContextsRef.current?.output.close();
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-3xl mx-auto w-full">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-3">Live Hub</h2>
        <p className="text-white/50">Experience low-latency, natural voice conversations.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          {isActive && (
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping scale-150 opacity-20"></div>
          )}
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
              isActive 
                ? 'bg-red-500/10 border-4 border-red-500 shadow-2xl shadow-red-500/20' 
                : isConnecting
                  ? 'bg-white/5 border-4 border-white/10 animate-pulse'
                  : 'bg-indigo-600 border-4 border-indigo-400/50 hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/40'
            }`}
          >
            {isConnecting ? (
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : isActive ? (
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>

        <div className="text-center">
           <p className={`text-xl font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-white/60'}`}>
              {isActive ? 'Lumina is listening...' : isConnecting ? 'Establishing link...' : 'Tap to start talking'}
           </p>
           {isActive && (
              <div className="flex gap-1 mt-4 justify-center">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
           )}
        </div>

        <div className="w-full glass-morphism rounded-3xl border border-white/10 p-6 h-64 overflow-y-auto flex flex-col gap-3">
          <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-bold">Transcription History</div>
          {transcription.length === 0 ? (
            <p className="text-white/20 text-sm italic">Words will appear here as you speak...</p>
          ) : (
            transcription.map((line, idx) => (
              <div key={idx} className={`text-sm ${line.startsWith('You:') ? 'text-indigo-300' : 'text-white/80'}`}>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
