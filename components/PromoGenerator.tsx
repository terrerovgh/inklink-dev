
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Instagram, Type, Image as ImageIcon } from 'lucide-react';
import { Tattoo, Profile } from '../types';

interface PromoGeneratorProps {
  artist: Profile;
  tattoo?: Tattoo | null; // Optional pre-selected tattoo
  onClose: () => void;
}

export const PromoGenerator: React.FC<PromoGeneratorProps> = ({ artist, tattoo, onClose }) => {
  const [headline, setHeadline] = useState(tattoo?.isFlash ? 'AVAILABLE FLASH' : 'FRESH INK');
  const [accentColor, setAccentColor] = useState('#10b981'); // Emerald default

  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden">
        
        {/* Editor Sidebar */}
        <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1">Promo Builder</h2>
            <p className="text-xs text-zinc-500">Create IG Stories in seconds</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-2 block">Headline Text</label>
              <input 
                value={headline}
                onChange={(e) => setHeadline(e.target.value.toUpperCase())}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-2 block">Accent Color</label>
              <div className="flex gap-2">
                {['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#ec4899'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${accentColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
             <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
               <Instagram className="w-4 h-4" /> Share to Stories
             </button>
             <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
               <Download className="w-4 h-4" /> Download PNG
             </button>
             <button onClick={onClose} className="w-full text-zinc-500 hover:text-white py-2 text-sm">
               Cancel
             </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
            />

            {/* The Story Card */}
            <div 
              ref={cardRef}
              className="aspect-[9/16] h-full max-h-[600px] bg-black border border-white/10 relative shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Image Area */}
                <div className="flex-1 relative bg-zinc-900 overflow-hidden">
                    {tattoo ? (
                        <img src={tattoo.imageUrl} className="w-full h-full object-cover opacity-90" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-xs">Select a Tattoo first</span>
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Content Area */}
                <div className="p-8 relative z-10 bg-black">
                     {/* Dynamic Badge */}
                     <div className="absolute -top-5 left-8 px-4 py-1.5 rounded-full text-black font-bold text-sm tracking-wide transform -rotate-2 shadow-lg"
                          style={{ backgroundColor: accentColor }}>
                        {headline}
                     </div>

                     <div className="flex justify-between items-end mt-4">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-white leading-tight mb-1">{tattoo?.description || 'Custom Work'}</h3>
                            <p className="text-zinc-400 text-sm flex items-center gap-2">
                                By {artist.handle} <span className="text-blue-500">✓</span>
                            </p>
                        </div>
                        <div className="text-right">
                             {tattoo?.price && (
                                 <div className="text-xl font-mono text-white mb-1">${tattoo.price}</div>
                             )}
                             <div className="text-[10px] uppercase tracking-widest text-zinc-500">Albuquerque</div>
                        </div>
                     </div>

                     <div className="mt-6 border-t border-white/20 pt-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-black font-display font-bold text-sm">Ik</span>
                             </div>
                             <span className="text-xs font-medium text-white">Book on InkLink</span>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded text-[10px] text-zinc-300">
                             Link in Bio
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
