
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
import MarketplaceDetail from './components/MarketplaceDetail';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, MapPin, 
  Heart, Filter, Zap,
  CheckCircle, XCircle,
  Wand2, Loader2, Info, Grid as GridIcon, Map as MapIcon, Gavel, Save,
  Pencil, Globe, Instagram, RotateCcw, X, Plus, Trash2, LayoutGrid, Star, ImagePlus, MessageSquare, Calendar
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
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [savedTattooIds, setSavedTattooIds] = useState<string[]>([]);
  
  // Dashboard State Control for Deep Linking
  const [dashboardState, setDashboardState] = useState<{tab?: any, contactId?: string}>({});

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
  
  const handleMarketItemClick = (id: string) => {
    setSelectedRequestId(id);
    setView('market-detail');
  };

  const handleBidSubmit = (request: MarketRequest, amount: number, message: string) => {
      // 1. Simulate creating a conversation or navigating to existing one
      // In a real app, this would hit an API.
      // We will tell the Dashboard to open the 'messages' tab and select the contact ID equal to the client's ID.
      
      setDashboardState({
          tab: 'messages',
          contactId: request.clientId
      });
      
      setView('dashboard');
  };
  
  const handleContactArtist = (artistId: string) => {
      setDashboardState({
          tab: 'messages',
          contactId: artistId
      });
      setView('dashboard');
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
        referenceImages: projectData.references,
        generatedSketch: projectData.generatedSketch,
        userPhoto: projectData.userPhoto,
        bodyPart: projectData.bodyZone,
        estimatedHours: projectData.report?.estimatedHours
    };

    setMarketRequests(prev => [newRequest, ...prev]);
    setView('market');
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
                
                <MapExplorer artists={MOCK_ARTISTS} onArtistSelect={handleArtistClick} />

                <GuestFeed tattoos={masterTattooList} />
             </div>
          )}
          
          {view === 'market' && (
             <Marketplace 
                requests={marketRequests} 
                onLaunchStudio={() => setShowStudio(true)}
                onItemClick={handleMarketItemClick}
             />
          )}

          {view === 'market-detail' && selectedRequestId && (
              <MarketplaceDetail 
                 key="market-detail"
                 request={marketRequests.find(r => r.id === selectedRequestId)!}
                 onBack={() => setView('market')}
                 onBidSubmit={handleBidSubmit}
              />
          )}

          {view === 'dashboard' && user && (
            <Dashboard 
              key="dashboard" 
              user={user}
              savedTattooIds={savedTattooIds} 
              onViewChange={setView}
              initialTab={dashboardState.tab || 'overview'}
              initialContactId={dashboardState.contactId}
            />
          )}

          {view === 'profile' && selectedArtistId && (
            <ArtistProfile 
                key="profile" 
                artistId={selectedArtistId} 
                onBack={() => setView('home')} 
                allTattoos={masterTattooList}
                onTattooAction={handleTattooAction}
                onContact={handleContactArtist}
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

const Marketplace: React.FC<{ requests: MarketRequest[], onLaunchStudio: () => void, onItemClick: (id: string) => void }> = ({ requests, onLaunchStudio, onItemClick }) => {
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
          <SpotlightCard key={req.id} className="p-6 bg-surface/30 cursor-pointer" onClick={() => onItemClick(req.id)}>
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
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-2xl line-clamp-2">
              {req.description}
            </p>

            {req.generatedSketch && (
                <div className="mb-6 h-24 w-24 bg-white p-2 rounded-lg rotate-2 shadow-lg float-right -mt-16 border border-zinc-200">
                    <img src={req.generatedSketch} className="w-full h-full object-contain mix-blend-multiply" />
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
    onContact?: (artistId: string) => void;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ artistId, onBack, allTattoos, onTattooAction, onContact }) => {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [artist, setArtist] = useState<Profile | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(true);
  
  const isOwner = user?.role === UserRole.ARTIST && user?.artistProfileId === artistId;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Booking State
  const [appointmentType, setAppointmentType] = useState<'Consultation' | 'Session' | 'Touch-up'>('Consultation');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'success'>('idle');

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
        setSaveStatus('saving');
        // Simulate network delay
        setTimeout(() => {
            setArtist(formData);
            localStorage.setItem(`inklink_artist_${artistId}`, JSON.stringify(formData));
            setSaveStatus('saved');
            
            // Exit edit mode after showing success state
            setTimeout(() => {
                setSaveStatus('idle');
                setIsEditing(false);
            }, 1000);
        }, 800);
    }
  };
  
  // Simulated Editing Actions (Gallery)
  const toggleFeaturedTattoo = (tattooId: string, currentStatus: boolean) => {
      onTattooAction?.('update', { id: tattooId, isFeatured: !currentStatus });
  };
  
  const deleteTattoo = (tattooId: string) => {
      onTattooAction?.('delete', { id: tattooId });
  };
  
  const addMockTattoo = () => {
      const mockImage = `https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=400&timestamp=${Date.now()}`;
      onTattooAction?.('add', { 
          artistId, 
          artistName: artist?.name || 'Artist', 
          artistAvatar: artist?.avatarUrl || '',
          imageUrl: mockImage,
          description: 'New Gallery Upload',
          style: 'Custom',
          bodyPart: 'Arm',
          likes: 0
      });
  };

  const calculateFees = () => {
      // Mock calculation based on type
      const base = appointmentType === 'Consultation' ? 50 : 150; // 50 consult, 150 deposit
      const taxRate = 0.07875; // NM GRT
      const tax = base * taxRate;
      return { fee: base, tax: tax, total: base + tax };
  };
  
  const handleBookingSubmit = () => {
      if (!selectedDate || !selectedTime) return;
      setBookingStatus('processing');
      setTimeout(() => {
          setBookingStatus('success');
      }, 1500);
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
            {isOwner && (
                <button 
                    onClick={() => !isEditing && setIsEditing(true)} 
                    disabled={isEditing}
                    className={`bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 ${isEditing ? 'opacity-50 cursor-default' : ''}`}
                >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                </button>
            )}
        </div>
        
        {/* Cover Image */}
        {isEditing ? (
             <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                 <img src={formData?.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                 <div className="z-10 bg-black/60 p-4 rounded-xl backdrop-blur-md w-96">
                    <label className="text-xs text-zinc-400 block mb-2">Cover Image URL</label>
                    <input 
                        value={formData?.coverUrl} 
                        onChange={e => setFormData(prev => ({...prev!, coverUrl: e.target.value}))}
                        className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm"
                    />
                 </div>
             </div>
        ) : (
            <img src={artist.coverUrl} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background z-10"></div>
      </div>

      <div className="px-4 md:px-12 max-w-7xl mx-auto -mt-24 relative z-20">
         <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="relative">
                <img src={artist.avatarUrl} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-background shadow-2xl object-cover" />
                {isEditing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl backdrop-blur-sm cursor-pointer border-4 border-white/20">
                        <Pencil className="text-white w-8 h-8" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 mb-2 w-full">
                {isEditing ? (
                    <div className="space-y-3 bg-surface/80 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                        <input 
                            value={formData?.name} 
                            onChange={e => setFormData(prev => ({...prev!, name: e.target.value}))}
                            className="text-3xl font-bold bg-transparent border-b border-white/20 w-full focus:outline-none focus:border-white"
                            placeholder="Artist Name"
                        />
                        <div className="flex gap-4">
                            <input 
                                value={formData?.location} 
                                onChange={e => setFormData(prev => ({...prev!, location: e.target.value}))}
                                className="bg-transparent border-b border-white/20 text-zinc-400 focus:outline-none"
                                placeholder="Location"
                            />
                        </div>
                         {/* Save Button */}
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={saveStatus !== 'idle'}
                            className={`w-full py-2 font-bold rounded-lg mt-2 flex items-center justify-center gap-2 transition-all duration-300 ${
                                saveStatus === 'saved' 
                                    ? 'bg-emerald-500 text-white' 
                                    : saveStatus === 'saving'
                                        ? 'bg-zinc-600 text-zinc-300'
                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                        >
                            {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                            {saveStatus === 'idle' && 'Save Changes'}
                            {saveStatus === 'saving' && 'Saving...'}
                            {saveStatus === 'saved' && 'Saved!'}
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{artist.name}</h1>
                        <div className="text-zinc-400 flex flex-wrap items-center gap-4 mt-2">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {artist.location}</span>
                            <span className="flex items-center gap-1 text-yellow-400"><Heart className="w-4 h-4 fill-current" /> {artist.rating}</span>
                            {artist.verified && <span className="flex items-center gap-1 text-blue-400"><Zap className="w-4 h-4 fill-current"/> Verified Artist</span>}
                        </div>
                    </>
                )}
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-2 space-y-10">
                {/* BIO */}
                <section>
                    <h3 className="font-display text-xl mb-4 font-semibold text-white">About</h3>
                    {isEditing ? (
                        <textarea 
                            value={formData?.bio}
                            onChange={e => setFormData(prev => ({...prev!, bio: e.target.value}))}
                            className="w-full h-32 bg-surface border border-white/10 rounded-xl p-4 text-zinc-300 focus:outline-none"
                        />
                    ) : (
                        <p className="text-zinc-400 leading-relaxed">{artist.bio}</p>
                    )}
                </section>
                
                {/* STYLES */}
                <section>
                    <h3 className="font-display text-xl mb-4 font-semibold text-white">Styles</h3>
                    <div className="flex flex-wrap gap-2">
                        {(isEditing ? formData?.styleTags : artist.styleTags)?.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-300">
                                {tag}
                                {isEditing && <button onClick={() => setFormData(prev => ({...prev!, styleTags: prev!.styleTags.filter(t => t !== tag)}))} className="ml-2 text-zinc-500 hover:text-red-400">×</button>}
                            </span>
                        ))}
                        {isEditing && (
                            <button 
                                onClick={() => {
                                    const newTag = prompt("Enter new style tag:");
                                    if(newTag) setFormData(prev => ({...prev!, styleTags: [...prev!.styleTags, newTag]}));
                                }}
                                className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-bold hover:bg-indigo-500 hover:text-white"
                            >
                                + Add Tag
                            </button>
                        )}
                    </div>
                </section>
                
                {/* HIGHLIGHTS (Pinned) */}
                {(featuredWorks.length > 0 || isEditing) && (
                    <section>
                        <h3 className="font-display text-xl mb-4 font-semibold text-white flex items-center gap-2">
                             <Star className="w-5 h-5 text-yellow-500 fill-current" /> Featured Works
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {featuredWorks.map(t => (
                                <div key={t.id} className="relative flex-shrink-0 w-48 aspect-[3/4] rounded-xl overflow-hidden group">
                                    <img src={t.imageUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                        <p className="text-xs font-bold text-white truncate">{t.description}</p>
                                    </div>
                                    {isEditing && (
                                        <button 
                                            onClick={() => toggleFeaturedTattoo(t.id, true)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-yellow-500 hover:bg-white hover:text-black transition-colors"
                                            title="Unpin"
                                        >
                                            <Star className="w-4 h-4 fill-current" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {featuredWorks.length === 0 && isEditing && (
                                <div className="w-48 aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-500 text-sm p-4 text-center">
                                    Pin photos from gallery below to show here
                                </div>
                            )}
                        </div>
                    </section>
                )}
                
                {/* FULL GALLERY (Instagram Grid) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6 border-t border-white/10 pt-4 w-full">
                            <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-t border-white -mt-[17px] pt-4">
                                <LayoutGrid className="w-4 h-4" /> Posts
                            </h3>
                            {isEditing && (
                                <button onClick={addMockTattoo} className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1">
                                    <ImagePlus className="w-3 h-3" /> Add Photo
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {galleryWorks.map(t => (
                            <div key={t.id} className="aspect-square bg-surface/30 cursor-pointer overflow-hidden group relative">
                                <img src={t.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleFeaturedTattoo(t.id, t.isFeatured || false); }}
                                            className={`p-2 rounded-full ${t.isFeatured ? 'bg-yellow-500 text-black' : 'bg-black/60 text-white hover:bg-yellow-500 hover:text-black'}`}
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteTattoo(t.id); }}
                                            className="p-2 bg-black/60 rounded-full text-red-400 hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            {/* SIDEBAR: INFO & BOOKING */}
            <div className="space-y-6">
               <div className="p-6 rounded-2xl bg-surface/30 border border-white/5 backdrop-blur-sm sticky top-24">
                   <h3 className="font-medium mb-4 text-white flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-indigo-400" /> 
                       {bookingStatus === 'success' ? 'Request Sent!' : 'Book Appointment'}
                   </h3>
                   
                   {bookingStatus === 'success' ? (
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-fade-in">
                           <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                               <CheckCircle className="w-6 h-6 text-black" />
                           </div>
                           <h4 className="text-white font-bold mb-1">Request Received</h4>
                           <p className="text-zinc-400 text-sm">Status: <span className="text-amber-400 font-bold">Pending Approval</span></p>
                           <p className="text-xs text-zinc-500 mt-2">The artist will review your request shortly.</p>
                           <button onClick={() => setBookingStatus('idle')} className="mt-4 text-xs text-white underline">Book another</button>
                       </div>
                   ) : (
                       <div className="space-y-4">
                          {/* Type Selector */}
                          <div className="flex bg-black/40 p-1 rounded-lg">
                              {['Consultation', 'Session', 'Touch-up'].map((type) => (
                                  <button 
                                    key={type}
                                    onClick={() => setAppointmentType(type as any)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${appointmentType === type ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                  >
                                      {type.split(' ')[0]}
                                  </button>
                              ))}
                          </div>

                          {/* Date Grid */}
                          <div>
                              <label className="text-xs font-medium text-zinc-500 mb-2 block">Select Date (Oct)</label>
                              <div className="grid grid-cols-7 gap-1">
                                  {Array.from({length: 14}, (_, i) => i + 20).map(day => (
                                      <button 
                                        key={day} 
                                        disabled={day < 24} // Mock disabled past dates
                                        onClick={() => setSelectedDate(day)}
                                        className={`aspect-square rounded flex items-center justify-center text-xs font-medium transition-all
                                            ${selectedDate === day 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110 z-10' 
                                                : day < 24 
                                                    ? 'text-zinc-700 cursor-not-allowed bg-white/5' 
                                                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                      >
                                          {day}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {/* Time Slots */}
                          {selectedDate && (
                             <div className="animate-fade-in">
                                <label className="text-xs font-medium text-zinc-500 mb-2 block">Available Times</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['10:00', '13:00', '15:30', '17:00'].map(time => (
                                        <button 
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-1.5 text-xs rounded border transition-all ${
                                                selectedTime === time 
                                                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                                                    : 'border-white/10 bg-black/20 text-zinc-400 hover:border-white/30'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                             </div>
                          )}

                          {/* Price Breakdown */}
                          <div className="bg-black/20 rounded-lg p-3 space-y-1">
                             <div className="flex justify-between text-xs text-zinc-400">
                                 <span>{appointmentType} Fee</span>
                                 <span>${calculateFees().fee}</span>
                             </div>
                             <div className="flex justify-between text-xs text-zinc-400">
                                 <span>NM Gross Receipts Tax (7.8%)</span>
                                 <span>${calculateFees().tax.toFixed(2)}</span>
                             </div>
                             <div className="border-t border-white/5 pt-1 mt-1 flex justify-between text-sm font-bold text-white">
                                 <span>Total Deposit</span>
                                 <span>${calculateFees().total.toFixed(2)}</span>
                             </div>
                          </div>

                          <div className="flex gap-3">
                              <button 
                                  onClick={handleBookingSubmit}
                                  disabled={!selectedDate || !selectedTime || bookingStatus === 'processing'}
                                  className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                  {bookingStatus === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Booking'}
                              </button>
                              
                              <button 
                                  onClick={() => onContact && onContact(artistId)}
                                  className="px-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center"
                                  title="Message Artist"
                              >
                                  <MessageSquare className="w-5 h-5" />
                              </button>
                          </div>
                       </div>
                   )}
               </div>
               
               {/* Social Links (Editable) */}
               <div className="flex gap-4 justify-center">
                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
                                <Instagram className="w-4 h-4 text-zinc-400" />
                                <input placeholder="@username" value={formData?.socials?.instagram} onChange={e => setFormData(p => ({...p!, socials: {...p!.socials, instagram: e.target.value}}))} className="bg-transparent text-sm text-white focus:outline-none w-full" />
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10">
                                <Globe className="w-4 h-4 text-zinc-400" />
                                <input placeholder="website.com" value={formData?.socials?.website} onChange={e => setFormData(p => ({...p!, socials: {...p!.socials, website: e.target.value}}))} className="bg-transparent text-sm text-white focus:outline-none w-full" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {artist.socials?.instagram && (
                                <a href={`https://instagram.com/${artist.socials.instagram}`} target="_blank" className="p-3 bg-surface border border-white/10 rounded-full hover:bg-white hover:text-black transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {artist.socials?.website && (
                                <a href={`https://${artist.socials.website}`} target="_blank" className="p-3 bg-surface border border-white/10 rounded-full hover:bg-white hover:text-black transition-colors">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </>
                    )}
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
