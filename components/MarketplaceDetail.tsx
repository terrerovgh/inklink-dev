
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, DollarSign, MapPin, 
  Sparkles, Layers, Image as IconImage, Send,
  MessageSquare
} from 'lucide-react';
import { MarketRequest } from '../types';

interface MarketplaceDetailProps {
  request: MarketRequest;
  onBack: () => void;
  onBidSubmit: (request: MarketRequest, amount: number, message: string) => void;
}

const MarketplaceDetail: React.FC<MarketplaceDetailProps> = ({ request, onBack, onBidSubmit }) => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidMessage, setBidMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount > 0) {
      onBidSubmit(request, bidAmount, bidMessage);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-display font-bold text-white">Project Details</h2>
          <p className="text-xs text-zinc-500">#{request.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visuals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden">
             {request.userPhoto ? (
                <div className="relative aspect-[3/4] w-full">
                   <img src={request.userPhoto} className="w-full h-full object-cover" />
                   {request.generatedSketch && (
                       <div className="absolute bottom-4 right-4 w-1/3 bg-black/80 p-1 rounded border border-white/10">
                           <img src={request.generatedSketch} className="w-full h-auto mix-blend-screen" />
                           <p className="text-[10px] text-center text-zinc-400 mt-1">AI Stencil</p>
                       </div>
                   )}
                   <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-white">Client Mockup</span>
                   </div>
                </div>
             ) : request.generatedSketch ? (
                <div className="aspect-square w-full p-8 flex items-center justify-center bg-white relative">
                   <img src={request.generatedSketch} className="w-full h-full object-contain" />
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
             ) : (
                <div className="aspect-video bg-zinc-900 flex items-center justify-center text-zinc-600">
                    <IconImage className="w-12 h-12 mb-2 opacity-50" />
                    <p>No Visuals Provided</p>
                </div>
             )}
          </div>

          {request.referenceImages && request.referenceImages.length > 0 && (
             <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Client References</h3>
                <div className="grid grid-cols-4 gap-4">
                   {request.referenceImages.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10">
                         <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Specs & Bidding */}
        <div className="space-y-6">
           
           {/* Client Card */}
           <div className="p-6 bg-surface border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <img src={request.clientAvatar || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover" />
                 <div>
                    <h3 className="font-bold text-white">{request.clientName}</h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                       <MapPin className="w-3 h-3" /> {request.location}
                    </div>
                 </div>
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">{request.title}</h1>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">{request.description}</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Budget</div>
                    <div className="text-emerald-400 font-mono font-bold">{request.budgetRange}</div>
                 </div>
                 <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Layers className="w-3 h-3"/> Placement</div>
                    <div className="text-white font-medium">{request.bodyPart || 'Unspecified'}</div>
                 </div>
                 <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Style</div>
                    <div className="text-white font-medium">{request.style}</div>
                 </div>
                 <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Est. Time</div>
                    <div className="text-white font-medium">{request.estimatedHours ? `${request.estimatedHours}h` : 'Unknown'}</div>
                 </div>
              </div>
           </div>

           {/* Bidding Interface */}
           <div className="p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
               <h3 className="text-lg font-display font-bold text-white mb-4 relative">Submit Proposal</h3>
               
               <form onSubmit={handleSubmit} className="space-y-4 relative">
                  <div>
                     <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 block">Your Quote ($)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-400">$</span>
                        <input 
                           type="number" 
                           required
                           min="50"
                           value={bidAmount || ''}
                           onChange={(e) => setBidAmount(parseInt(e.target.value))}
                           className="w-full bg-black/40 border border-indigo-500/30 rounded-xl pl-7 pr-4 py-2 text-white focus:outline-none focus:border-indigo-400 transition-colors font-mono text-lg" 
                           placeholder="0.00"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 block">Message to Client</label>
                     <textarea 
                        required
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        className="w-full bg-black/40 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 transition-colors text-sm h-24 resize-none"
                        placeholder={`Hi ${request.clientName}, I'd love to take this on. Here's my approach...`} 
                     />
                  </div>

                  <button 
                     type="submit" 
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                     <Send className="w-4 h-4" /> Send Proposal & Start Chat
                  </button>
                  <p className="text-[10px] text-center text-indigo-300/60 mt-2">
                     Submitting opens a direct line with the client.
                  </p>
               </form>
           </div>

        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceDetail;
