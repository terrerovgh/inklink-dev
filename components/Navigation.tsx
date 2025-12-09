import React from 'react';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
}

const Navigation: React.FC<NavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'market', icon: Search, label: 'Market' },
    { id: 'canvas', icon: PlusSquare, label: 'Create' },
    { id: 'dashboard', icon: User, label: 'Studio' },
  ];

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 glass items-center justify-between px-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-display font-bold text-lg">Ik</span>
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">InkLink</span>
        </div>

        <div className="flex items-center gap-1 bg-surface/50 border border-white/5 p-1 rounded-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <button className="text-sm font-medium text-muted hover:text-white">Sign In</button>
           <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
             Connect Wallet
           </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-20 bg-background/90 backdrop-blur-xl border-t border-white/5 pb-4 px-6 flex items-center justify-between">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentView === item.id ? 'text-white' : 'text-zinc-600'
            }`}
          >
            <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-current' : ''}`} strokeWidth={currentView === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navigation;