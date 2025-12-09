
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, Heart } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { Tattoo } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoginView } from './LoginView';

interface GuestFeedProps {
  tattoos: Tattoo[];
}

const GuestFeed: React.FC<GuestFeedProps> = ({ tattoos }) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // If user is not logged in, we only show first 5 items
  // If they try to scroll past, we trigger the modal
  const visibleTattoos = user ? tattoos : tattoos.slice(0, 5);

  const handleInteraction = () => {
    if (!user) {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="relative">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pt-2 pb-20">
        {visibleTattoos.map((tattoo, index) => (
          <div key={tattoo.id} className="break-inside-avoid mb-6 relative group">
             {/* Blur effect for the last visible item if guest */}
             {!user && index === 4 && (
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
             )}
             
             <SpotlightCard className="bg-surface">
                <div className="relative cursor-pointer" onClick={handleInteraction}>
                  <img src={tattoo.imageUrl} alt={tattoo.description} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                     <div className="text-white">
                        <p className="font-bold">{tattoo.description}</p>
                        <p className="text-xs text-zinc-300">{tattoo.artistName}</p>
                     </div>
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white backdrop-blur-md hover:bg-pink-500 hover:text-white transition-colors">
                     <Heart className="w-4 h-4" />
                  </button>
                </div>
             </SpotlightCard>
          </div>
        ))}
      </div>

      {/* The "Paywall" / Auth Trigger Block */}
      {!user && (
        <div ref={bottomRef} className="py-12 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-t from-background to-transparent pt-32 -mt-32 relative z-20">
           <div className="w-16 h-16 bg-surface/50 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Lock className="w-8 h-8 text-indigo-400" />
           </div>
           <div>
              <h3 className="text-2xl font-bold text-white mb-2">Unlock the Full Gallery</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                 Join InkLink to view thousands of local designs, create your own projects, and connect with artists.
              </p>
           </div>
           <button 
             onClick={() => setShowAuthModal(true)}
             className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
           >
              <LogIn className="w-5 h-5" /> Sign In / Register
           </button>
        </div>
      )}

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
             <div className="w-full max-w-md relative">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-white z-50 p-2 bg-black/20 rounded-full hover:bg-white/20"
                >
                    ✕
                </button>
                <LoginView />
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestFeed;
