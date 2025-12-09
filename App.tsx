
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navigation from './components/Navigation';
import GridBackground from './components/GridBackground';
import SpotlightCard from './components/SpotlightCard';
import MapExplorer from './components/MapExplorer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import GuestFeed from './components/GuestFeed';
import TattooStudio from './components/TattooStudio';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, MapPin, 
  Heart, Filter, Zap,
  CheckCircle, XCircle,
  Wand2, Loader2, Info, Grid as GridIcon, Map as MapIcon, Gavel, Save,
  Pencil, Globe, Instagram, RotateCcw, X, Plus, Trash2, LayoutGrid, Star, ImagePlus
} from 'lucide-react';
import { analyzeRequest, generateTattooDesign } from './services/geminiService';
import { Profile, UserRole, Tattoo, MarketRequest } from './types';
import { MOCK_ARTISTS, MOCK_TATTOOS, MOCK_REQUESTS } from './data/mockData';

// --- MAIN WRAPPER ---
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

// --- APP COMPONENT ---

function App() {
  const { user, isLoading, updateUser } = useAuth();
  const [view, setView] = useState('home');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [savedTattooIds, setSavedTattooIds] = useState<string[]>([]);
  
  // Studio Wizard State
  const [showStudio, setShowStudio] = useState(false);
  const [marketRequests, setMarketRequests] = useState<MarketRequest[]>(MOCK_REQUESTS);

  // Global State for Tattoos
  const [masterTattooList, setMasterTattooList] = useState<Tattoo[]>(() => {
    const saved = localStorage.getItem('inklink_tattoos');
    return saved ? JSON.parse(saved) : MOCK_TATTOOS;
  });

  useEffect(() => {
    localStorage.setItem('inklink_tattoos', JSON.stringify(masterTattooList));
  }, [masterTattooList]);

  useEffect(() => {
    if (user && user.savedTattooIds) {
      setSavedTattooIds(user.savedTattooIds);
    }
  }, [user]);

  const handleArtistClick = (id: string) => {
    setSelectedArtistId(id);
    setView('profile');
  };

  const toggleSaveTattoo = (id: string) => {
    let newIds = [];
    if (savedTattooIds.includes(id)) {
      newIds = savedTattooIds.filter(tid => tid !== id);
    } else {
      newIds = [...savedTattooIds, id];
    }
    setSavedTattooIds(newIds);
    updateUser({ savedTattooIds: newIds });
  };

  const handleTattooAction = (action: 'add' | 'delete' | 'update', tattoo: Partial<Tattoo>) => {
    if (action === 'add' && tattoo.imageUrl) {
        const newTattoo = {
            ...tattoo,
            id: `t_${Date.now()}`,
            likes: 0,
            tags: [],
        } as Tattoo;
        setMasterTattooList(prev => [newTattoo, ...prev]);
    } else if (action === 'delete' && tattoo.id) {
        setMasterTattooList(prev => prev.filter(t => t.id !== tattoo.id));
    } else if (action === 'update' && tattoo.id) {
        setMasterTattooList(prev => prev.map(t => t.id === tattoo.id ? { ...t, ...tattoo } : t));
    }
  };

  const handleProjectPublish = (projectData: any) => {
    setShowStudio(false);
    
    // Create new market request from wizard data
    const newRequest: MarketRequest = {
        id: `r_${Date.now()}`,
        clientId: user?.id || 'guest',
        clientName: user?.name || 'Guest User',
        clientAvatar: user?.avatarUrl,
        title: 'New Custom Project',
        description: projectData.concept,
        budgetRange: `$${projectData.report?.priceMin} - $${projectData.report?.priceMax}`,
        location: user?.preferences?.location || 'Albuquerque',
        style: 'Custom Line Art',
        status: 'open',
        createdAt: 'Just now',
        bids: 0,
        referenceImages: projectData.references
    };

    setMarketRequests(prev => [newRequest, ...prev]);
    setView('market');
    // In a real app, we would save the sketch URL and technical notes too
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  }

  return (
    <div className="relative min-h-screen bg-background text-primary selection:bg-white selection:text-black font-sans overflow-x-hidden antialiased">
      <GridBackground />
      
      {/* Navigation hidden if in Wizard */}
      {!showStudio && <Navigation currentView={view} setView={setView} />}
      
      <main className="relative pt-20 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'home' && (
             <div className="space-y-6">
                {/* Hero / Studio Trigger */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden group cursor-pointer" onClick={() => setShowStudio(true)}>
                   <div className="relative z-10 max-w-lg">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/10">
                         <Sparkles className="w-3 h-3" /> New AI Feature
                      </div>
                      <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Start Your Tattoo Project</h1>
                      <p className="text-white/80 mb-6">Use our 3D Body Selector and AI Artist to design your next piece and get bids from top local studios.</p>
                      <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors">
                         Launch Studio
                      </button>
                   </div>
                   <img src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>

                <GuestFeed tattoos={masterTattooList} />
             </div>
          )}
          
          {view === 'market' && (
             <Marketplace 
                requests={marketRequests} 
                onLaunchStudio={() => setShowStudio(true)}
             />
          )}

          {view === 'dashboard' && user && (
            <Dashboard 
              key="dashboard" 
              user={user}
              savedTattooIds={savedTattooIds} 
              onViewChange={setView}
            />
          )}

          {view === 'profile' && selectedArtistId && (
            <ArtistProfile 
                key="profile" 
                artistId={selectedArtistId} 
                onBack={() => setView('home')} 
                allTattoos={masterTattooList}
                onTattooAction={handleTattooAction}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Full Screen Tattoo Studio Wizard */}
      <AnimatePresence>
         {showStudio && (
            <motion.div initial={{opacity:0, y: 100}} animate={{opacity:1, y:0}} exit={{opacity:0, y:100}} className="fixed inset-0 z-50">
               <TattooStudio onCancel={() => setShowStudio(false)} onComplete={handleProjectPublish} />
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-VIEWS ---

const Marketplace: React.FC<{ requests: MarketRequest[], onLaunchStudio: () => void }> = ({ requests, onLaunchStudio }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Project Board</h1>
          <p className="text-muted mt-2">Browse open projects or post your own to get bids.</p>
        </div>
        <button 
          onClick={onLaunchStudio}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid gap-4">
        {requests.map((req) => (
          <SpotlightCard key={req.id} className="p-6 bg-surface/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 {req.clientAvatar ? (
                    <img src={req.clientAvatar} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 border border-white/5 flex items-center justify-center text-xs font-bold">
                      {req.clientName.substring(0,2)}
                    </div>
                 )}
                <div>
                  <h3 className="font-medium text-lg text-white">{req.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{req.clientName}</span>
                    <span>•</span>
                    <span>{req.createdAt}</span>
                    {req.bids !== undefined && <span className="text-indigo-400 font-medium ml-2">• {req.bids} Bids</span>}
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

            {req.referenceImages && req.referenceImages.length > 0 && (
                <div className="flex gap-2 mb-6">
                    {req.referenceImages.map((img, i) => (
                        <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover border border-white/5" />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {req.style}</span>
              </div>
              <div className="flex gap-3">
                 <button className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                    <Gavel className="w-3 h-3" /> Place Bid
                 </button>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </motion.div>
  );
};

interface ArtistProfileProps {
    artistId: string;
    onBack: () => void;
    allTattoos: Tattoo[];
    onTattooAction?: (action: 'add' | 'delete' | 'update', tattoo: Partial<Tattoo>) => void;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ artistId, onBack, allTattoos, onTattooAction }) => {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [artist, setArtist] = useState<Profile | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(true);
  
  const isOwner = user?.role === UserRole.ARTIST && user?.artistProfileId === artistId;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(`inklink_artist_${artistId}`);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        setArtist(parsed);
        setFormData(parsed);
        setIsBioLoading(false);
    } else {
        const foundArtist = MOCK_ARTISTS.find(a => a.id === artistId);
        if (foundArtist) {
            setArtist(foundArtist);
            setFormData(foundArtist);
            setIsBioLoading(false); 
        }
    }
  }, [artistId]);

  const handleSaveProfile = () => {
    if (formData) {
        setArtist(formData);
        localStorage.setItem(`inklink_artist_${artistId}`, JSON.stringify(formData));
        setIsEditing(false);
    }
  };

  const calculateFees = () => {
      // Mock calculation
      return { fee: 50, tax: 4.5, total: 54.5 };
  };

  const featuredWorks = useMemo(() => allTattoos.filter(t => t.artistId === artistId && (t.isFeatured || t.isFlash)), [artistId, allTattoos]);
  const galleryWorks = useMemo(() => allTattoos.filter(t => t.artistId === artistId), [artistId, allTattoos]);

  if (!artist) return <div className="text-center pt-20">Artist not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="-mt-20">
      <div className="h-[45vh] w-full relative group">
        <div className="absolute top-24 left-4 md:left-8 z-30 flex gap-2">
            <button onClick={onBack} className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 hover:bg-black/60 transition-colors">
            ← Back
            </button>
        </div>
        <img src={artist.coverUrl} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background z-10"></div>
      </div>

      <div className="px-4 md:px-12 max-w-7xl mx-auto -mt-24 relative z-20">
         <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <img src={artist.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-background shadow-2xl object-cover" />
            <div className="flex-1 mb-2">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{artist.name}</h1>
                <div className="text-zinc-400 flex items-center gap-4 mt-2">
                    <span>{artist.location}</span>
                    <span className="flex items-center gap-1 text-yellow-400"><Heart className="w-4 h-4 fill-current" /> {artist.rating}</span>
                </div>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-2 space-y-10">
                <section>
                    <h3 className="font-display text-xl mb-4 font-semibold text-white">About</h3>
                    <p className="text-zinc-400 leading-relaxed">{artist.bio}</p>
                </section>
                
                {/* Full Gallery Grid */}
                <section>
                    <h3 className="font-display text-xl mb-4 font-semibold text-white">Gallery</h3>
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {galleryWorks.map(t => (
                            <div key={t.id} className="aspect-square bg-surface/30 cursor-pointer overflow-hidden group">
                                <img src={t.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            <div className="space-y-6">
               <div className="p-6 rounded-2xl bg-surface/30 border border-white/5 backdrop-blur-sm sticky top-24">
                   <h3 className="font-medium mb-4 text-white">Studio Info</h3>
                   <div className="space-y-2 text-sm text-zinc-400">
                      <div className="flex justify-between"><span>Hourly</span> <span className="text-white">${artist.pricing.hourly}/hr</span></div>
                      <div className="flex justify-between"><span>Min</span> <span className="text-white">${artist.pricing.min}</span></div>
                   </div>
                   <button className="w-full mt-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200">
                       Request Booking
                   </button>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
