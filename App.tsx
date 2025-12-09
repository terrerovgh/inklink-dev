
import React, { useState, useEffect, useMemo } from 'react';
import Navigation from './components/Navigation';
import GridBackground from './components/GridBackground';
import SpotlightCard from './components/SpotlightCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, MapPin, DollarSign, Clock, 
  ChevronRight, Heart, Share2, Filter, MoreHorizontal,
  Calendar, CheckCircle, XCircle, Send, MessageSquare,
  Wand2, Loader2, Info, Zap, Bookmark
} from 'lucide-react';
import { analyzeRequest, generateTattooDesign, generateArtistBio } from './services/geminiService';
import { Tattoo, MarketRequest, Appointment, Profile, UserRole } from './types';

// --- MOCK DATA ---
const MOCK_TATTOOS: Tattoo[] = [
  { 
    id: '1', artistId: 'a1', artistName: 'Kai Verno', artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1560707303-4e9803d165df?q=80&w=800&auto=format&fit=crop', 
    style: 'Cyberpunk', bodyPart: 'Forearm', description: 'Glitch art fox', likes: 243, tags: ['fox', 'animal', 'neon', 'glitch'],
    styleTags: ['Cyberpunk', 'Glitch', 'Neo-Futurism']
  },
  { 
    id: '2', artistId: 'a2', artistName: 'Elena Rose', artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop', 
    style: 'Neo-Traditional', bodyPart: 'Chest', description: 'Sacred heart dagger', likes: 892, tags: ['heart', 'dagger', 'traditional', 'red'],
    styleTags: ['Neo-Traditional', 'Old School', 'Color'],
    isFlash: true, price: 350
  },
  { 
    id: '3', artistId: 'a3', artistName: 'Sato Ink', artistAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=800&auto=format&fit=crop', 
    style: 'Realism', bodyPart: 'Thigh', description: 'Vintage floral composition', likes: 561, tags: ['flower', 'rose', 'vintage', 'botanical'],
    styleTags: ['Realism', 'Black and Grey', 'Botanical']
  },
  { 
    id: '4', artistId: 'a1', artistName: 'Kai Verno', artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop', 
    style: 'Abstract', bodyPart: 'Shoulder', description: 'Fluid smoke lines', likes: 120, tags: ['smoke', 'abstract', 'lines'],
    styleTags: ['Abstract', 'Flow', 'Minimalist'],
    isFlash: true, price: 200
  },
  { 
    id: '5', artistId: 'a4', artistName: 'Mikey D', artistAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=800&auto=format&fit=crop', 
    style: 'Blackwork', bodyPart: 'Back', description: 'Geometric spine alignment', likes: 884, tags: ['geometry', 'spine', 'blackwork', 'pattern'],
    styleTags: ['Blackwork', 'Geometric', 'Ornamental']
  },
  { 
    id: '6', artistId: 'a5', artistName: 'Sarah Ink', artistAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c23?q=80&w=800&auto=format&fit=crop', 
    style: 'Watercolor', bodyPart: 'Arm', description: 'Splatter Wolf', likes: 432, tags: ['wolf', 'watercolor', 'color', 'animal'],
    styleTags: ['Watercolor', 'Abstract', 'Color']
  },
  { 
    id: '7', artistId: 'a6', artistName: 'Leo Geometric', artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1550537687-c9135742ca59?q=80&w=800&auto=format&fit=crop', 
    style: 'Geometric', bodyPart: 'Forearm', description: 'Sacred Geometry Mandala', likes: 315, tags: ['mandala', 'sacred geometry', 'dotwork'],
    styleTags: ['Geometric', 'Dotwork', 'Blackwork'],
    isFlash: true, price: 400
  },
  { 
    id: '8', artistId: 'a7', artistName: 'Mia Sketch', artistAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1590246294305-9e342390317e?q=80&w=800&auto=format&fit=crop', 
    style: 'Illustrative', bodyPart: 'Calf', description: 'Whimsical Forest Mushroom', likes: 198, tags: ['mushroom', 'nature', 'fairy'],
    styleTags: ['Illustrative', 'Sketch', 'Fantasy'],
    isFlash: true, price: 180
  },
  { 
    id: '9', artistId: 'a8', artistName: 'Kenji Tato', artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=800&auto=format&fit=crop', 
    style: 'Japanese', bodyPart: 'Sleeve', description: 'Traditional Dragon Koi', likes: 650, tags: ['dragon', 'koi', 'waves'],
    styleTags: ['Japanese', 'Irezumi', 'Traditional']
  },
  { 
    id: '10', artistId: 'a9', artistName: 'Luna Color', artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1525439722822-29729a674172?q=80&w=800&auto=format&fit=crop', 
    style: 'Watercolor', bodyPart: 'Back', description: 'Nebula Space Scene', likes: 520, tags: ['space', 'galaxy', 'stars'],
    styleTags: ['Watercolor', 'Cosmic', 'Abstract']
  },
  { 
    id: '11', artistId: 'a10', artistName: 'Koa Tribal', artistAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', 
    imageUrl: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop', 
    style: 'Tribal', bodyPart: 'Shoulder', description: 'Polynesian Armor', likes: 410, tags: ['tribal', 'polynesian', 'maori'],
    styleTags: ['Tribal', 'Blackwork', 'Cultural'],
    isFlash: true, price: 500
  },
  {
    id: '12', artistId: 'a1', artistName: 'Kai Verno', artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop',
    style: 'Cyberpunk', bodyPart: 'Leg', description: 'Circuitry Pattern', likes: 150, tags: ['circuit', 'tech', 'pattern'],
    styleTags: ['Cyberpunk', 'Blackwork'],
    isFlash: true, price: 250
  }
];

const MOCK_ARTISTS: Profile[] = [
  {
    id: 'a1', role: UserRole.ARTIST, name: 'Kai Verno', handle: '@kai.verno',
    bio: "Forging future-primitive aesthetics in the heart of Brooklyn. Kai blends biomechanical textures with cyberpunk themes, creating high-contrast blackwork that transforms skin into armor.",
    location: 'Brooklyn, NY', styleTags: ['Cyberpunk', 'Biomechanical', 'Blackwork'],
    pricing: { min: 250, hourly: 180 }, verified: true, rating: 4.9, reviewCount: 124,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a2', role: UserRole.ARTIST, name: 'Elena Rose', handle: '@elena.rose',
    bio: "Portland-based artist specializing in bold, vibrant Neo-Traditional designs. Elena breathes new life into classic motifs with saturated color palettes and clean, timeless linework.",
    location: 'Portland, OR', styleTags: ['Neo-Traditional', 'Old School', 'Color'],
    pricing: { min: 150, hourly: 130 }, verified: true, rating: 4.8, reviewCount: 89,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a3', role: UserRole.ARTIST, name: 'Sato Ink', handle: '@sato.ink',
    bio: "Mastering the delicate balance of light and shadow in Tokyo. Sato specializes in hyper-realistic botanical black and grey work, capturing the fleeting beauty of nature.",
    location: 'Tokyo, Japan', styleTags: ['Realism', 'Black and Grey', 'Botanical'],
    pricing: { min: 300, hourly: 200 }, verified: true, rating: 5.0, reviewCount: 210,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a4', role: UserRole.ARTIST, name: 'Mikey D', handle: '@mikey.d',
    bio: "London's architect of the skin. Mikey constructs intricate geometric patterns and ornamental blackwork, focusing on precision, symmetry, and flow with the body's natural lines.",
    location: 'London, UK', styleTags: ['Blackwork', 'Geometric', 'Ornamental'],
    pricing: { min: 200, hourly: 150 }, verified: false, rating: 4.7, reviewCount: 45,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a5', role: UserRole.ARTIST, name: 'Sarah Ink', handle: '@sarah.ink',
    bio: "Austin-based artist turning skin into canvas. Sarah's watercolor style blends fluid abstract splashes with vibrant color, creating soft, painterly pieces full of movement.",
    location: 'Austin, TX', styleTags: ['Watercolor', 'Abstract', 'Color'],
    pricing: { min: 180, hourly: 140 }, verified: true, rating: 4.9, reviewCount: 156,
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c23?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a6', role: UserRole.ARTIST, name: 'Leo Geometric', handle: '@leo.geo',
    bio: "Berlin's dotwork specialist. Leo creates hypnotic geometric mandalas and sacred geometry patterns, utilizing precise pointillism to build depth and texture.",
    location: 'Berlin, DE', styleTags: ['Geometric', 'Dotwork', 'Blackwork'],
    pricing: { min: 220, hourly: 160 }, verified: true, rating: 4.8, reviewCount: 92,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1550537687-c9135742ca59?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a7', role: UserRole.ARTIST, name: 'Mia Sketch', handle: '@mia.draws',
    bio: "Illustrating dreams in Seattle. Mia specializes in whimsical, sketch-style tattoos, bringing fantasy creatures and storybook elements to life with a raw, hand-drawn aesthetic.",
    location: 'Seattle, WA', styleTags: ['Illustrative', 'Sketch', 'Fantasy'],
    pricing: { min: 160, hourly: 140 }, verified: false, rating: 4.6, reviewCount: 38,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1590246294305-9e342390317e?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a8', role: UserRole.ARTIST, name: 'Kenji Tato', handle: '@kenji.irezumi',
    bio: "Preserving tradition in Kyoto. Kenji honors the ancient art of Irezumi, crafting powerful Japanese bodysuits featuring dragons, koi, and waves with authentic flow and history.",
    location: 'Kyoto, Japan', styleTags: ['Japanese', 'Irezumi', 'Traditional'],
    pricing: { min: 400, hourly: 250 }, verified: true, rating: 5.0, reviewCount: 310,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a9', role: UserRole.ARTIST, name: 'Luna Color', handle: '@luna.space',
    bio: "Capturing the cosmos in Miami. Luna specializes in vibrant watercolor galaxy scenes, blending nebulas and stars into abstract, colorful compositions that defy gravity.",
    location: 'Miami, FL', styleTags: ['Watercolor', 'Cosmic', 'Abstract'],
    pricing: { min: 180, hourly: 150 }, verified: true, rating: 4.8, reviewCount: 112,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1525439722822-29729a674172?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a10', role: UserRole.ARTIST, name: 'Koa Tribal', handle: '@koa.ink',
    bio: "Honoring ancestry in Honolulu. Koa specializes in traditional Polynesian and Maori tribal markings, hand-crafting meaningful patterns that tell personal and cultural stories.",
    location: 'Honolulu, HI', styleTags: ['Tribal', 'Blackwork', 'Cultural'],
    pricing: { min: 250, hourly: 180 }, verified: true, rating: 4.9, reviewCount: 180,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=2000&auto=format&fit=crop'
  }
];

const MOCK_REQUESTS: MarketRequest[] = [
  { id: 'r1', clientId: 'c1', clientName: 'Sarah J.', title: 'Minimalist Mountain Range', description: 'Looking for fine line work of the Swiss Alps. Approx 3x5 inches.', budgetRange: '$200 - $400', location: 'Brooklyn, NY', style: 'Fine Line', status: 'open', createdAt: '2h ago', bids: 3 },
  { id: 'r2', clientId: 'c2', clientName: 'Davide B.', title: 'Japanese Dragon Sleeve', description: 'Full sleeve, black and grey. Needs to cover an old scar.', budgetRange: '$2000+', location: 'Los Angeles, CA', style: 'Irezumi', status: 'open', createdAt: '5h ago', bids: 12 },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'ap1', clientName: 'Sarah J.', artistName: 'Kai Verno', date: 'Oct 24', time: '14:00', status: 'confirmed', type: 'Session', depositPaid: true },
  { id: 'ap2', clientName: 'Mike R.', artistName: 'Kai Verno', date: 'Oct 25', time: '10:00', status: 'pending', type: 'Consultation', depositPaid: false },
];

// --- APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('home');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [savedTattooIds, setSavedTattooIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inklink_saved_tattoos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleArtistClick = (id: string) => {
    setSelectedArtistId(id);
    setView('profile');
  };

  const toggleSaveTattoo = (id: string) => {
    setSavedTattooIds(prev => {
      const newIds = prev.includes(id) 
        ? prev.filter(tid => tid !== id) 
        : [...prev, id];
      localStorage.setItem('inklink_saved_tattoos', JSON.stringify(newIds));
      return newIds;
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-primary selection:bg-white selection:text-black font-sans overflow-x-hidden antialiased">
      <GridBackground />
      
      <Navigation currentView={view} setView={setView} />
      
      <main className="relative pt-20 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <DiscoveryFeed 
              key="home" 
              onArtistClick={handleArtistClick} 
              savedTattooIds={savedTattooIds}
              onToggleSave={toggleSaveTattoo}
            />
          )}
          {view === 'market' && <Marketplace key="market" />}
          {view === 'canvas' && <CanvasStudio key="canvas" />}
          {view === 'dashboard' && (
            <Dashboard 
              key="dashboard" 
              savedTattooIds={savedTattooIds} 
            />
          )}
          {view === 'profile' && <ArtistProfile key="profile" artistId={selectedArtistId || 'a1'} onBack={() => setView('home')} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-VIEWS ---

const DiscoveryFeed: React.FC<{ 
  onArtistClick: (id: string) => void; 
  savedTattooIds: string[];
  onToggleSave: (id: string) => void;
}> = ({ onArtistClick, savedTattooIds, onToggleSave }) => {
  const [search, setSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{message: string, tags: string[]} | null>(null);
  const [activeTattoos, setActiveTattoos] = useState(MOCK_TATTOOS);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      setActiveTattoos(MOCK_TATTOOS);
      setAiAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    const result = await analyzeRequest(search);
    setIsAnalyzing(false);

    setAiAnalysis({
      message: result.conversationResponse,
      tags: result.filters?.keywords || []
    });

    // Basic client-side filtering based on AI results
    const filtered = MOCK_TATTOOS.filter(t => {
      const styleMatch = result.filters?.style ? t.style.toLowerCase().includes(result.filters.style.toLowerCase()) : true;
      const bodyMatch = result.filters?.bodyPart ? t.bodyPart.toLowerCase().includes(result.filters.bodyPart.toLowerCase()) : true;
      // Very basic fuzzy keyword matching
      const keywordMatch = result.filters?.keywords.some(k => 
        t.description.toLowerCase().includes(k.toLowerCase()) || 
        t.tags?.some(tag => tag.toLowerCase().includes(k.toLowerCase())) ||
        t.styleTags?.some(stag => stag.toLowerCase().includes(k.toLowerCase()))
      ) ?? true;
      
      return styleMatch && (bodyMatch || keywordMatch);
    });

    setActiveTattoos(filtered.length > 0 ? filtered : MOCK_TATTOOS); // Fallback if too strict
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      {/* Search Section */}
      <div className="sticky top-24 z-30 flex flex-col items-center w-full pointer-events-none gap-4">
        <form onSubmit={handleSearch} className="pointer-events-auto w-full max-w-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center px-6 py-4 gap-4 transition-all focus-within:ring-1 focus-within:ring-white/20">
            {isAnalyzing ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Describe your vision (e.g., 'Neo-traditional tiger on forearm')..." 
              className="bg-transparent border-none outline-none flex-1 text-sm md:text-base placeholder:text-muted/70 text-white"
            />
            <button type="submit" className="bg-white text-black p-2 rounded-full hover:bg-zinc-200 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* AI Insight Chip */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="pointer-events-auto bg-surfaceHighlight/90 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-sm text-zinc-300 flex items-center gap-3 shadow-lg"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>{aiAnalysis.message}</span>
              {aiAnalysis.tags.length > 0 && (
                <div className="flex gap-1 border-l border-white/10 pl-3">
                   {aiAnalysis.tags.map(t => <span key={t} className="bg-white/5 px-2 py-0.5 rounded text-xs text-zinc-400">#{t}</span>)}
                </div>
              )}
              <button onClick={() => {setAiAnalysis(null); setSearch(''); setActiveTattoos(MOCK_TATTOOS)}} className="ml-2 hover:text-white"><XCircle className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pt-6">
        {activeTattoos.map((tattoo) => {
          const isSaved = savedTattooIds.includes(tattoo.id);
          return (
            <SpotlightCard key={tattoo.id} className="break-inside-avoid group bg-surface">
              <div className="relative">
                  <img src={tattoo.imageUrl} alt={tattoo.description} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-lg font-medium font-display leading-none mb-1 text-white">{tattoo.description}</h3>
                      <p className="text-sm text-zinc-400 mb-2">{tattoo.style} • {tattoo.bodyPart}</p>
                      
                      {tattoo.styleTags && (
                          <div className="flex flex-wrap gap-1 mb-4">
                              {tattoo.styleTags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                      {tag}
                                  </span>
                              ))}
                          </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                          <button onClick={() => onArtistClick(tattoo.artistId)} className="flex items-center gap-2 hover:bg-white/10 rounded-full pr-3 py-1 transition-colors">
                            <img src={tattoo.artistAvatar} className="w-6 h-6 rounded-full ring-1 ring-white/20" />
                            <span className="text-xs font-medium text-zinc-300">@{tattoo.artistName}</span>
                          </button>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onToggleSave(tattoo.id); }}
                              className={`p-2 backdrop-blur-md rounded-full transition-all ${isSaved ? 'bg-pink-500 text-white' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}
                            >
                                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                      </div>
                  </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </motion.div>
  );
};

const CanvasStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        const image = await generateTattooDesign(prompt);
        setGeneratedImage(image);
        setIsGenerating(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto h-[80vh] flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col justify-center">
                <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                        <Wand2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-4 text-white">AI Tattoo Canvas</h1>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        Describe your dream tattoo concept. Our AI model allows you to visualize style, placement, and composition instantly.
                    </p>
                    
                    <div className="space-y-4">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A geometric wolf head with floral accents, fine line style, black and white..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32 resize-none"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isGenerating ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isGenerating ? 'Dreaming...' : 'Generate Design'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-surface/30 border border-white/5 rounded-3xl flex items-center justify-center overflow-hidden relative min-h-[400px]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5" />
                {generatedImage ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full p-4">
                        <img src={generatedImage} alt="Generated Design" className="w-full h-full object-contain drop-shadow-2xl" />
                        <div className="absolute bottom-6 right-6 flex gap-2">
                             <button className="bg-white/10 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">Save to Collection</button>
                             <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">Find Artist</button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center text-zinc-600">
                        <div className="w-20 h-20 border-2 border-dashed border-zinc-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 opacity-20" />
                        </div>
                        <p>Your design will appear here</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

const Marketplace: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted mt-2">Open requests from clients worldwide.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-surface hover:bg-white/5 text-sm transition-colors text-zinc-300">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
            Post Request
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_REQUESTS.map((req) => (
          <SpotlightCard key={req.id} className="p-6 bg-surface/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-white/5 flex items-center justify-center text-xs font-bold">
                  {req.clientName.substring(0,2)}
                </div>
                <div>
                  <h3 className="font-medium text-lg text-white">{req.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{req.clientName}</span>
                    <span>•</span>
                    <span>{req.createdAt}</span>
                    {req.bids && <span className="text-indigo-400 font-medium ml-2">• {req.bids} Bids</span>}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {req.budgetRange}
              </span>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-2xl">
              {req.description}
            </p>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {req.style}</span>
              </div>
              <button className="text-sm font-medium text-white hover:underline decoration-zinc-500 underline-offset-4">
                View Details
              </button>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </motion.div>
  );
};

const ArtistProfile: React.FC<{ artistId: string; onBack: () => void }> = ({ artistId, onBack }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [artist, setArtist] = useState<Profile | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(true);

  // Load artist data based on ID
  useEffect(() => {
    const foundArtist = MOCK_ARTISTS.find(a => a.id === artistId);
    if (foundArtist) {
        setArtist(foundArtist);
        // If bio is somehow missing, we could trigger generation here, but we have pre-filled them.
        setIsBioLoading(false); 
    }
  }, [artistId]);

  const artistTattoos = useMemo(() => MOCK_TATTOOS.filter(t => t.artistId === artistId), [artistId]);
  const flashDesigns = useMemo(() => {
    const flash = artistTattoos.filter(t => t.isFlash);
    return flash.length > 0 ? flash : artistTattoos.slice(0, 3);
  }, [artistTattoos]);

  if (!artist) return <div className="text-center pt-20">Artist not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="-mt-20">
      {/* Header Image */}
      <div className="h-[45vh] w-full relative">
        <div className="absolute top-24 left-4 md:left-8 z-20 flex gap-2">
            <button onClick={onBack} className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 hover:bg-black/60 transition-colors">
            ← Back
            </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background z-10"></div>
        <img 
          src={artist.coverUrl} 
          className="w-full h-full object-cover" 
          style={{ objectPosition: 'center 30%' }}
        />
      </div>

      <div className="px-4 md:px-12 max-w-7xl mx-auto -mt-24 relative z-20">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="relative">
              <img src={artist.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-background shadow-2xl object-cover" />
              {artist.verified && <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full border-4 border-background"><CheckCircle className="w-4 h-4" /></div>}
          </div>
          
          <div className="flex-1 mb-2">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{artist.name}</h1>
            <div className="text-zinc-400 flex flex-wrap items-center gap-4 mt-2 text-sm md:text-base">
              <span className="flex items-center gap-1 text-white"><MapPin className="w-4 h-4" /> {artist.location}</span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
              <span className="flex items-center gap-1 text-yellow-400"><Heart className="w-4 h-4 fill-current" /> {artist.rating} ({artist.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="flex gap-3 mb-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-surface border border-white/10 font-medium text-white hover:bg-white/5 transition-colors">
              Message
            </button>
            <button onClick={() => setBookingOpen(true)} className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">
              Book Now
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
           <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="font-display text-xl mb-4 font-semibold text-white">About</h3>
                <div className="text-zinc-400 leading-relaxed text-lg min-h-[60px]">
                  {isBioLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-indigo-400">
                        <Sparkles className="w-3 h-3" /> AI curating biography...
                      </div>
                    </div>
                  ) : (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{artist.bio}</motion.p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                    {artist.styleTags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full border border-white/10 text-xs text-zinc-300 bg-white/5">{tag}</span>
                    ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-display text-xl font-semibold text-white">Featured Flash</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Instant Book
                  </span>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {flashDesigns.length > 0 ? (
                    flashDesigns.map((tattoo) => (
                      <div key={tattoo.id} className="min-w-[200px] w-[200px] aspect-[3/4] rounded-xl overflow-hidden relative group border border-white/10 flex-shrink-0 cursor-pointer">
                          <img src={tattoo.imageUrl} alt={tattoo.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                              <span className="text-white font-medium text-sm line-clamp-1">{tattoo.description}</span>
                              {tattoo.price ? (
                                <span className="text-emerald-400 text-xs font-bold mt-1">${tattoo.price}</span>
                              ) : (
                                <span className="text-zinc-400 text-xs mt-1">Make an offer</span>
                              )}
                          </div>
                          {tattoo.isFlash && (
                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded-full p-1.5 border border-white/10">
                               <Zap className="w-3 h-3 text-amber-400 fill-current" />
                             </div>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                      No flash designs available currently.
                    </div>
                  )}
                </div>
              </section>
           </div>
           
           <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-surface/30 border border-white/5 backdrop-blur-sm sticky top-24">
                <h3 className="font-medium mb-4 text-white">Studio Info</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-zinc-400">Minimum</span>
                    <span className="text-white font-mono">${artist.pricing.min}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-zinc-400">Hourly Rate</span>
                    <span className="text-white font-mono">${artist.pricing.hourly}/hr</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-zinc-400">Deposit</span>
                    <span className="text-white">30% (Non-refundable)</span>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-300 leading-relaxed flex gap-2">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        Typically books 2-3 months in advance.
                    </p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Booking Drawer */}
      <AnimatePresence>
        {bookingOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setBookingOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: '0%' }} 
              exit={{ y: '100%' }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-surface rounded-t-3xl z-50 p-6 md:p-12 overflow-y-auto border-t border-white/10 shadow-2xl"
            >
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white">Request Booking</h2>
                            <p className="text-zinc-400 text-sm mt-1">with {artist.name}</p>
                        </div>
                        <button onClick={() => setBookingOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"><XCircle /></button>
                    </div>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-400">Select Date</label>
                            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                                {['M','T','W','T','F','S','S'].map(d => <span key={d} className="text-xs text-zinc-500 font-medium">{d}</span>)}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({length:31}).map((_, i) => (
                                    <button key={i} className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all ${i === 23 ? 'bg-white text-black font-bold shadow-lg shadow-white/20' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}>
                                        {i+1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-400">Available Slots</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['10:00 AM', '02:00 PM', '04:30 PM'].map(t => (
                                    <button key={t} className="py-3 rounded-lg border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all text-sm text-zinc-300 active:bg-white active:text-black">
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-zinc-400">Consultation Fee</span>
                                <span className="text-white">$50.00</span>
                            </div>
                            <button className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">
                                Confirm Request ($50.00)
                            </button>
                            <p className="text-center text-xs text-zinc-500 mt-4">Secure payment via Stripe. Fully refundable up to 48h before.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Dashboard: React.FC<{ savedTattooIds: string[] }> = ({ savedTattooIds }) => {
    const [role, setRole] = useState<'client' | 'artist'>('artist');
    const [activeTab, setActiveTab] = useState<'appointments' | 'messages' | 'saved'>('appointments');

    const savedTattoos = useMemo(() => {
        return MOCK_TATTOOS.filter(t => savedTattooIds.includes(t.id));
    }, [savedTattooIds]);

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="max-w-5xl mx-auto pt-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold tracking-tight">Studio Manager</h2>
                <div className="bg-surface border border-white/10 p-1 rounded-lg flex">
                    <button onClick={() => setRole('client')} className={`px-4 py-1.5 rounded-md text-sm transition-all font-medium ${role === 'client' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Client View</button>
                    <button onClick={() => setRole('artist')} className={`px-4 py-1.5 rounded-md text-sm transition-all font-medium ${role === 'artist' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Artist View</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1 space-y-2">
                    <button onClick={() => setActiveTab('appointments')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'appointments' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Appointments</span>
                        {role === 'artist' && <span className="ml-auto bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">2</span>}
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'messages' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Messages</span>
                    </button>
                    <button onClick={() => setActiveTab('saved')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'saved' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <Bookmark className="w-5 h-5" />
                        <span className="font-medium">Saved Tattoos</span>
                        <span className="ml-auto bg-zinc-800 text-zinc-400 text-xs font-bold px-2 py-0.5 rounded-full">{savedTattooIds.length}</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors text-zinc-400 hover:text-white">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Earnings</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 min-h-[500px] bg-surface/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    {activeTab === 'appointments' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium mb-4 text-white">Upcoming Sessions</h3>
                            {MOCK_APPOINTMENTS.map(appt => (
                                <div key={appt.id} className="flex items-center justify-between p-4 bg-surface/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-display font-bold text-lg text-zinc-200 border border-white/5">
                                            {appt.date.split(' ')[1]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{role === 'artist' ? appt.clientName : appt.artistName}</div>
                                            <div className="text-sm text-zinc-500">{appt.type} • {appt.time}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border inline-block mb-1 ${
                                            appt.status === 'confirmed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/20 text-amber-400 bg-amber-500/10'
                                        }`}>
                                            {appt.status}
                                        </div>
                                        {appt.depositPaid && <div className="text-[10px] text-zinc-500">Deposit Paid</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'messages' && (
                        <div className="h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0" />
                                    <div className="bg-surface border border-white/10 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm leading-relaxed text-zinc-200">
                                        Hey! I saw your flash sheet. Is the snake design still available for next Tuesday?
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-zinc-700/50 border border-white/10 flex-shrink-0" />
                                    <div className="bg-white text-black p-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm leading-relaxed shadow-lg">
                                        Hi! Yes it is. I have a slot at 2pm. Does that work for you?
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 relative">
                                <input className="w-full bg-surface/50 border border-white/10 rounded-full px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all" placeholder="Type a message..." />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors">
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium mb-4 text-white">Your Inspiration</h3>
                            {savedTattoos.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No saved tattoos yet. Go explore!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {savedTattoos.map(t => (
                                        <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
                                            <img src={t.imageUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform">
                                                    View
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-xs text-white drop-shadow-md truncate">{t.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
