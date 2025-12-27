
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './views/ChatView';
import { ImageView } from './views/ImageView';
import { VideoView } from './views/VideoView';
import { LiveView } from './views/LiveView';
import { InsightView } from './views/InsightView';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case View.CHAT:
        return <ChatView />;
      case View.IMAGE:
        return <ImageView />;
      case View.VIDEO:
        return <VideoView />;
      case View.LIVE:
        return <LiveView />;
      case View.INSIGHT:
        return <InsightView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 flex flex-col h-full transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'}`}>
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold gradient-text">Lumina Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/60">
              Gemini Powered
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20"></div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto relative">
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export default App;
