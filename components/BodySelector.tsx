
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BodySelectorProps {
  onSelect: (zone: string) => void;
  selectedZone: string | null;
}

// Simplified Human Body Map SVG
const BodySelector: React.FC<BodySelectorProps> = ({ onSelect, selectedZone }) => {
  // Using a simplified SVG representation for robustness in this environment
  // In a real production app with React-Three-Fiber, we would load a GLTF model here.
  
  const zones = [
    { id: 'head', d: 'M100,50 Q100,30 115,30 T130,50 Q130,70 115,70 T100,50', name: 'Neck/Head' },
    { id: 'chest', d: 'M85,80 L145,80 L140,130 L90,130 Z', name: 'Chest' },
    { id: 'arm_left', d: 'M85,80 L60,150 L80,150 L90,130 Z', name: 'Left Arm' },
    { id: 'arm_right', d: 'M145,80 L170,150 L150,150 L140,130 Z', name: 'Right Arm' },
    { id: 'torso', d: 'M90,130 L140,130 L135,180 L95,180 Z', name: 'Stomach/Ribs' },
    { id: 'leg_left', d: 'M95,180 L90,280 L110,280 L115,180 Z', name: 'Left Leg' },
    { id: 'leg_right', d: 'M135,180 L140,280 L120,280 L115,180 Z', name: 'Right Leg' },
  ];

  return (
    <div className="relative w-full h-[400px] bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
       <div className="absolute top-4 left-4 text-xs text-zinc-500">
          <p className="font-bold text-white">INTERACTIVE MAP</p>
          <p>Select placement zone</p>
       </div>

       <svg viewBox="0 0 230 350" className="h-full w-auto drop-shadow-2xl">
          <g transform="translate(0, 10)">
             {zones.map((zone) => (
                <motion.path
                   key={zone.id}
                   d={zone.d}
                   onClick={() => onSelect(zone.id)}
                   whileHover={{ scale: 1.05, fill: '#4f46e5' }}
                   animate={{ 
                      fill: selectedZone === zone.id ? '#4f46e5' : '#27272a',
                      stroke: selectedZone === zone.id ? '#818cf8' : '#52525b',
                      strokeWidth: 2
                   }}
                   className="cursor-pointer transition-colors duration-300"
                />
             ))}
          </g>
       </svg>

       {selectedZone && (
          <div className="absolute bottom-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
             Selected: {zones.find(z => z.id === selectedZone)?.name}
          </div>
       )}
    </div>
  );
};

export default BodySelector;
