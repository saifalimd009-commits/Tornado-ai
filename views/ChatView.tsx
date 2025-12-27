
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { Message } from '../types';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Hello! I am Lumina. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Placeholder for streaming assistant response
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMsg]);

    try {
      // Fix: Ensure history matches the expected role 'user' | 'model' required by Gemini SDK
      const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          parts: [{ text: m.text }]
        }));

      let fullText = '';
      const stream = geminiService.chatStream(input, history);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: fullText } : m));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: 'Error connecting to Gemini. Please try again.' } : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div className="flex-1 overflow-y-auto space-y-6 py-4 scroll-smooth pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'glass-morphism border border-white/10 text-white/90 shadow-xl'
            }`}>
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text || (isLoading && msg.role === 'assistant' && msg.id === messages[messages.length-1].id ? '...' : '')}</div>
              <div className={`text-[10px] mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 relative bg-[#111] rounded-2xl border border-white/10 p-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask me anything..."
          className="w-full bg-transparent border-none focus:ring-0 text-white p-3 resize-none max-h-40 min-h-[56px]"
          rows={1}
        />
        <div className="flex items-center justify-between px-2 pb-1">
          <div className="flex items-center gap-2">
             <button className="p-2 text-white/40 hover:text-white transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-xl transition-all ${
              input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 text-white/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
