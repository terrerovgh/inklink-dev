
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Calendar, MessageSquare, ImageIcon, Share2, 
  Settings, PenTool, Bookmark, CheckCircle, XCircle, 
  LogOut, PlusCircle, Search, Send, Loader2, Image as IconImage,
  Sparkles, Paperclip, MoveRight, FolderInput, Wand2, MoreVertical,
  Layout, PanelRightOpen, PanelRightClose, Trash2, MapPin, Phone, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, ChatMessage } from '../types';
import { PromoGenerator } from './PromoGenerator';
import { generateSmartReplies, refineMessageText } from '../services/geminiService';
import { MOCK_ARTISTS, MOCK_TATTOOS, MOCK_APPOINTMENTS } from '../data/mockData';

interface DashboardProps {
  user: User;
  savedTattooIds: string[];
  onViewChange: (view: string) => void;
  initialTab?: 'overview' | 'appointments' | 'messages' | 'portfolio' | 'marketing' | 'settings';
  initialContactId?: string | null;
}

// Mock Chat Data
const MOCK_CONTACTS = [
  { id: 'u1', name: 'Elena G.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', lastMessage: 'Does 2pm work for you?', time: '10m ago', unread: 2 },
  { id: 'u2', name: 'Marcus T.', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100', lastMessage: 'Thanks for the session!', time: '2h ago', unread: 0 },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: 'u1', text: 'Hi! I saw your flash sheet and loved the rose design.', timestamp: 1629823423423, isMe: false },
  { id: 'm2', senderId: 'me', text: 'Thanks Elena! Yes, that one is still available.', timestamp: 1629823455555, isMe: true },
  { id: 'm3', senderId: 'u1', text: 'Awesome. Here is a reference of the placement I was thinking.', timestamp: 1629823488888, isMe: false, attachments: [{id: 'att1', type: 'image', url: 'https://images.unsplash.com/photo-1590246294305-9e342390317e?q=80&w=300&auto=format&fit=crop'}] },
  { id: 'm4', senderId: 'me', text: 'Looks good. Let me check my schedule.', timestamp: 1629823522222, isMe: true },
  { id: 'm5', senderId: 'u1', text: 'Does 2pm work for you?', timestamp: 1629823622222, isMe: false },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, savedTattooIds, onViewChange, initialTab = 'overview', initialContactId = null }) => {
    const { logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showPromoGen, setShowPromoGen] = useState(false);
    
    // Chat State
    const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const [isRefining, setIsRefining] = useState(false);
    const [showProjectPanel, setShowProjectPanel] = useState(true);
    const [projectReferences, setProjectReferences] = useState<string[]>([]);
    const [refineTone, setRefineTone] = useState<'Professional' | 'Friendly' | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Create Post State
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostDesc, setNewPostDesc] = useState('');

    // Settings State
    const [settingsForm, setSettingsForm] = useState({
        name: user.name,
        location: user.preferences?.location || '',
        dateOfBirth: user.dateOfBirth || '',
        contactNumber: user.contactNumber || '',
        address: user.address || ''
    });
    const [saveSettingsStatus, setSaveSettingsStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const isArtist = user.role === UserRole.ARTIST;

    useEffect(() => {
        if (initialContactId) {
            const exists = MOCK_CONTACTS.find(c => c.id === initialContactId);
            setSelectedContactId(initialContactId);
        }
    }, [initialContactId]);

    const savedTattoos = useMemo(() => {
        return MOCK_TATTOOS.filter(t => savedTattooIds.includes(t.id));
    }, [savedTattooIds]);

    const artistPortfolio = useMemo(() => {
        if (!isArtist || !user.artistProfileId) return [];
        return MOCK_TATTOOS.filter(t => t.artistId === user.artistProfileId);
    }, [isArtist, user]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedContactId, smartReplies]);

    // Generate Smart Replies when last message changes
    useEffect(() => {
        if (!selectedContactId) return;
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg.isMe) {
             const history = messages.slice(-5).map(m => `${m.isMe ? 'Me' : 'Partner'}: ${m.text}`).join('\n');
             generateSmartReplies(history, isArtist ? 'Artist' : 'Client').then(setSmartReplies);
        } else {
             setSmartReplies([]);
        }
    }, [messages, selectedContactId, isArtist]);

    const handleSendMessage = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInput.trim()) return;
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: chatInput,
        timestamp: Date.now(),
        isMe: true
      };
      setMessages([...messages, newMsg]);
      setChatInput('');
      setRefineTone(null);
    };

    const handleSmartReply = (reply: string) => {
        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            text: reply,
            timestamp: Date.now(),
            isMe: true
        };
        setMessages([...messages, newMsg]);
    };

    const handleRefineMessage = async (tone: 'Professional' | 'Friendly') => {
        if (!chatInput) return;
        setIsRefining(true);
        const refined = await refineMessageText(`${chatInput} (Tone: ${tone})`, isArtist ? 'Artist' : 'Client');
        setChatInput(refined);
        setIsRefining(false);
        setRefineTone(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const newMsg: ChatMessage = {
                    id: Date.now().toString(),
                    senderId: 'me',
                    text: '',
                    timestamp: Date.now(),
                    isMe: true,
                    attachments: [{
                        id: `att_${Date.now()}`,
                        type: 'image',
                        url: ev.target?.result as string
                    }]
                };
                setMessages([...messages, newMsg]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveToProject = (imageUrl: string) => {
        if (!projectReferences.includes(imageUrl)) {
            setProjectReferences([...projectReferences, imageUrl]);
        }
    };
    
    const handleRemoveFromProject = (imageUrl: string) => {
        setProjectReferences(prev => prev.filter(i => i !== imageUrl));
    };

    const handleCreatePost = () => {
        setShowCreatePost(false);
        setNewPostDesc('');
    };

    const handleSaveSettings = () => {
        setSaveSettingsStatus('saving');
        setTimeout(() => {
            updateUser({
                name: settingsForm.name,
                dateOfBirth: settingsForm.dateOfBirth,
                contactNumber: settingsForm.contactNumber,
                address: settingsForm.address,
                preferences: {
                    ...user.preferences!,
                    location: settingsForm.location
                }
            });
            setSaveSettingsStatus('saved');
            setTimeout(() => setSaveSettingsStatus('idle'), 2000);
        }, 1000);
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="max-w-7xl mx-auto pt-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold tracking-tight text-white">
                    {isArtist ? 'Studio Command Center' : 'My InkLink'}
                  </h2>
                  <p className="text-zinc-400 text-sm">Welcome back, {user.name}</p>
                </div>
                
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Overview</span>
                    </button>
                    
                    <button onClick={() => setActiveTab('appointments')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'appointments' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Bookings</span>
                        {isArtist && <span className="ml-auto bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">2 New</span>}
                    </button>
                    
                    <button onClick={() => setActiveTab('messages')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'messages' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Messages</span>
                        <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</span>
                    </button>

                    {isArtist && (
                      <>
                        <button onClick={() => setActiveTab('portfolio')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'portfolio' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-medium">Portfolio & Posts</span>
                        </button>
                        <button onClick={() => setActiveTab('marketing')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'marketing' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium">Marketing</span>
                        </button>
                        <button onClick={() => onViewChange('canvas')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-zinc-400 hover:text-white hover:bg-white/5`}>
                            <PenTool className="w-5 h-5" />
                            <span className="font-medium">Open Sketchpad</span>
                        </button>
                      </>
                    )}

                    {!isArtist && (
                      <button onClick={() => setActiveTab('portfolio')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'portfolio' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                          <Bookmark className="w-5 h-5" />
                          <span className="font-medium">Saved Tattoos</span>
                      </button>
                    )}

                    <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-surface border border-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 min-h-[500px] bg-surface/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    
                    {activeTab === 'overview' && (
                       <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="p-4 bg-surface border border-white/5 rounded-xl">
                                <div className="text-zinc-400 text-sm mb-1">{isArtist ? 'Total Revenue' : 'Total Spent'}</div>
                                <div className="text-2xl font-bold text-white font-mono">{isArtist ? '$12,450' : '$450'}</div>
                             </div>
                             <div className="p-4 bg-surface border border-white/5 rounded-xl">
                                <div className="text-zinc-400 text-sm mb-1">{isArtist ? 'Profile Views' : 'Artists Visited'}</div>
                                <div className="text-2xl font-bold text-white font-mono">{isArtist ? '1,204' : '14'}</div>
                             </div>
                             <div className="p-4 bg-surface border border-white/5 rounded-xl">
                                <div className="text-zinc-400 text-sm mb-1">{isArtist ? 'Pending Requests' : 'Upcoming Sessions'}</div>
                                <div className="text-2xl font-bold text-white font-mono">{isArtist ? '5' : '1'}</div>
                             </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                              {MOCK_APPOINTMENTS.map(appt => (
                                <div key={appt.id} className="flex items-center justify-between p-4 bg-surface/40 rounded-xl border border-white/5">
                                   <div className="flex gap-4">
                                      <div className="w-2 h-full bg-indigo-500 rounded-full"></div>
                                      <div>
                                        <div className="font-medium text-white">{isArtist ? appt.clientName : appt.artistName}</div>
                                        <div className="text-sm text-zinc-500">{appt.type} on {appt.date}</div>
                                      </div>
                                   </div>
                                   <div className={`text-xs px-2 py-1 rounded border ${appt.status === 'confirmed' ? 'border-green-500/20 text-green-400' : 'border-amber-500/20 text-amber-400'}`}>
                                      {appt.status}
                                   </div>
                                </div>
                              ))}
                            </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-white">Manage Bookings</h3>
                              {isArtist && <button className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Sync Calendar</button>}
                            </div>
                            {MOCK_APPOINTMENTS.map(appt => (
                                <div key={appt.id} className="flex items-center justify-between p-4 bg-surface/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-display font-bold text-lg text-zinc-200 border border-white/5">
                                            {appt.date.split(' ')[1]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{isArtist ? appt.clientName : appt.artistName}</div>
                                            <div className="text-sm text-zinc-500">{appt.type} • {appt.time}</div>
                                            {isArtist && appt.priceEstimate && <div className="text-xs text-emerald-400 mt-1">Est. Revenue: ${appt.priceEstimate}</div>}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${
                                            appt.status === 'confirmed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/20 text-amber-400 bg-amber-500/10'
                                        }`}>
                                            {appt.status}
                                        </div>
                                        {isArtist && appt.status === 'pending' && (
                                          <div className="flex gap-2">
                                            <button className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"><CheckCircle className="w-4 h-4" /></button>
                                            <button className="p-1 hover:bg-red-500/20 rounded text-red-400"><XCircle className="w-4 h-4" /></button>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                       <div className="h-[600px] flex border border-white/10 rounded-xl bg-surface/40 overflow-hidden relative">
                           {/* Contacts List */}
                           <div className={`border-r border-white/10 bg-surface/20 flex flex-col ${selectedContactId ? 'hidden md:flex w-1/3' : 'w-full'}`}>
                              <div className="p-4 border-b border-white/10">
                                <div className="relative">
                                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                  <input placeholder="Search..." className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none" />
                                </div>
                              </div>
                              <div className="overflow-y-auto flex-1">
                                {MOCK_CONTACTS.map(contact => (
                                  <div 
                                    key={contact.id} 
                                    onClick={() => setSelectedContactId(contact.id)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors ${selectedContactId === contact.id ? 'bg-white/10' : ''}`}
                                  >
                                    <div className="relative">
                                      <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" />
                                      {contact.unread > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">{contact.unread}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="text-sm font-bold text-white truncate">{contact.name}</h4>
                                        <span className="text-xs text-zinc-500">{contact.time}</span>
                                      </div>
                                      <p className="text-xs text-zinc-400 truncate">{contact.lastMessage}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                           
                           {/* Chat Window */}
                           {selectedContactId ? (
                               <div className={`flex-1 flex flex-col bg-[#09090b] ${showProjectPanel && isArtist ? 'md:w-1/3' : 'md:w-2/3'}`}>
                                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedContactId(null)} className="md:hidden text-zinc-400 hover:text-white"><MoveRight className="w-5 h-5 rotate-180" /></button>
                                        <img src={MOCK_CONTACTS.find(c => c.id === selectedContactId)?.avatar || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full" />
                                        <span className="font-bold text-white">{MOCK_CONTACTS.find(c => c.id === selectedContactId)?.name || 'Unknown'}</span>
                                     </div>
                                     {isArtist && (
                                         <button onClick={() => setShowProjectPanel(!showProjectPanel)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
                                             {showProjectPanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                                         </button>
                                     )}
                                  </div>
                                  
                                  {/* Messages List */}
                                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                     {messages.map(msg => (
                                       <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`max-w-[85%] md:max-w-[70%]`}>
                                            {/* Image Attachments */}
                                            {msg.attachments && msg.attachments.map(att => (
                                                <div key={att.id} className="relative group mb-2 inline-block">
                                                    <img src={att.url} className="rounded-xl border border-white/10 max-h-60 object-cover" />
                                                    {isArtist && !msg.isMe && (
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                                                            <button 
                                                                onClick={() => handleSaveToProject(att.url)}
                                                                className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:scale-105 transition-transform shadow-lg"
                                                            >
                                                                <FolderInput className="w-3 h-3" /> Save to Project
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {msg.text && (
                                                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-surface border border-white/10 text-zinc-200 rounded-bl-none'}`}>
                                                    {msg.text}
                                                </div>
                                            )}
                                          </div>
                                       </div>
                                     ))}
                                     <div ref={chatEndRef} />
                                  </div>

                                  {/* Smart Replies */}
                                  <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar min-h-[32px]">
                                      <AnimatePresence>
                                          {smartReplies.map((reply, i) => (
                                              <motion.button
                                                  key={i}
                                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                                  exit={{ opacity: 0, scale: 0.9 }}
                                                  onClick={() => handleSmartReply(reply)}
                                                  className="flex-shrink-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-200 text-xs px-3 py-1.5 rounded-full hover:bg-indigo-500/30 transition-colors flex items-center gap-1 shadow-sm"
                                              >
                                                  <Sparkles className="w-3 h-3" /> {reply}
                                              </motion.button>
                                          ))}
                                      </AnimatePresence>
                                  </div>

                                  {/* Input Area */}
                                  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2 items-end bg-[#09090b]">
                                     <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
                                     >
                                        <Paperclip className="w-5 h-5" />
                                     </button>
                                     <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                     />
                                     
                                     <div className="flex-1 relative group">
                                        <input 
                                            value={chatInput}
                                            onChange={(e) => {
                                                setChatInput(e.target.value);
                                                if(refineTone) setRefineTone(null);
                                            }}
                                            placeholder="Type a message..." 
                                            className="w-full bg-surface border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-12 text-sm"
                                        />
                                        
                                        <AnimatePresence>
                                            {chatInput && (
                                                <div className="absolute right-2 top-1.5 flex gap-1">
                                                     {refineTone ? (
                                                        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex bg-surfaceHighlight rounded-lg p-1 border border-white/10 shadow-lg">
                                                            <button type="button" onClick={() => handleRefineMessage('Professional')} className="px-2 py-1 text-xs hover:bg-white/10 rounded text-zinc-300">Pro</button>
                                                            <button type="button" onClick={() => handleRefineMessage('Friendly')} className="px-2 py-1 text-xs hover:bg-white/10 rounded text-zinc-300">Friendly</button>
                                                        </motion.div>
                                                     ) : (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setRefineTone('Professional')}
                                                            disabled={isRefining}
                                                            className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
                                                            title="AI Improve Message"
                                                        >
                                                            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                        </button>
                                                     )}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                     </div>
                                     
                                     <button type="submit" disabled={!chatInput} className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-full text-white transition-colors shadow-lg shadow-indigo-500/20 flex-shrink-0">
                                       <Send className="w-5 h-5" />
                                     </button>
                                  </form>
                               </div>
                           ) : (
                               <div className="hidden md:flex flex-1 flex-col items-center justify-center text-zinc-500 bg-[#09090b]">
                                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                  <p>Select a conversation to start chatting</p>
                               </div>
                           )}

                           {/* Artist Project Panel (Right Column) */}
                           <AnimatePresence>
                               {isArtist && selectedContactId && showProjectPanel && (
                                   <motion.div 
                                      initial={{ width: 0, opacity: 0 }} 
                                      animate={{ width: 280, opacity: 1 }} 
                                      exit={{ width: 0, opacity: 0 }}
                                      className="border-l border-white/10 bg-surface/20 flex flex-col overflow-hidden"
                                   >
                                       <div className="p-4 border-b border-white/10 bg-surface/30">
                                           <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                               <FolderInput className="w-4 h-4 text-indigo-400" /> Project Reference
                                           </h3>
                                           <p className="text-[10px] text-zinc-500 mt-1">Elena's Rose Sleeve Project</p>
                                       </div>
                                       
                                       <div className="flex-1 p-4 overflow-y-auto">
                                            <div className="mb-6">
                                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Client Details</h4>
                                                <div className="space-y-2 text-sm text-zinc-300">
                                                    <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400 bg-emerald-500/10 px-1.5 rounded">Booked</span></div>
                                                    <div className="flex justify-between"><span>Budget:</span> <span>$800 - $1k</span></div>
                                                    <div className="flex justify-between"><span>Placement:</span> <span>Left Forearm</span></div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Reference Board</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {projectReferences.map((ref, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                                            <img src={ref} className="w-full h-full object-cover" />
                                                            <button 
                                                                onClick={() => handleRemoveFromProject(ref)}
                                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600">
                                                        <PlusCircle className="w-6 h-6 mb-1 opacity-50" />
                                                        <span className="text-[9px]">Add Ref</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 mt-2 text-center">
                                                    Click "Save to Project" on images in chat to add them here.
                                                </p>
                                            </div>
                                       </div>
                                   </motion.div>
                               )}
                           </AnimatePresence>
                       </div>
                    )}

                    {activeTab === 'portfolio' && isArtist && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-white">My Portfolio & Feed</h3>
                                    <p className="text-xs text-zinc-500">Manage what clients see on your profile and the main feed.</p>
                                </div>
                                <button 
                                  onClick={() => setShowCreatePost(true)}
                                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 shadow-lg shadow-white/10"
                                >
                                   <PlusCircle className="w-4 h-4" /> Create Post
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {artistPortfolio.map(t => (
                                    <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
                                        <img src={t.imageUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                            <button 
                                              onClick={() => setShowPromoGen(true)}
                                              className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform flex items-center gap-1 w-full justify-center"
                                            >
                                                <Share2 className="w-3 h-3" /> Promote
                                            </button>
                                            <button className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-500/40 transition-colors w-full justify-center">Delete</button>
                                        </div>
                                        <div className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            LIVE
                                        </div>
                                    </div>
                                ))}
                                <div 
                                  onClick={() => setShowCreatePost(true)}
                                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-colors cursor-pointer"
                                >
                                    <PlusCircle className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-medium">Add Photo</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'marketing' && isArtist && (
                        <div className="text-center py-12">
                           <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                              <Share2 className="w-10 h-10 text-indigo-400" />
                           </div>
                           <h3 className="text-xl font-bold text-white mb-2">Instagram Story Generator</h3>
                           <p className="text-zinc-400 max-w-md mx-auto mb-8">
                             Turn your flash sheets and finished work into professional, branded marketing assets for Instagram in seconds.
                           </p>
                           <button 
                             onClick={() => setShowPromoGen(true)}
                             className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                           >
                             Open Creator Tool
                           </button>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-white mb-6">Profile Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5">
                                    <img src={user.avatarUrl} className="w-16 h-16 rounded-full object-cover" />
                                    <div>
                                        <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Change Avatar</button>
                                        <p className="text-xs text-zinc-500 mt-1">Recommended 400x400px</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <input 
                                                value={settingsForm.name} 
                                                onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-white/30" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                                        <input defaultValue={user.email} disabled className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Location (City)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <input 
                                                value={settingsForm.location} 
                                                onChange={e => setSettingsForm({...settingsForm, location: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-white/30" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <input 
                                                type="date"
                                                value={settingsForm.dateOfBirth} 
                                                onChange={e => setSettingsForm({...settingsForm, dateOfBirth: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <input 
                                                value={settingsForm.contactNumber} 
                                                onChange={e => setSettingsForm({...settingsForm, contactNumber: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-white/30" 
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Address</label>
                                        <input 
                                            value={settingsForm.address} 
                                            onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30" 
                                            placeholder="Street, State, Zip"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                                <button onClick={() => setSettingsForm({
                                    name: user.name,
                                    location: user.preferences?.location || '',
                                    dateOfBirth: user.dateOfBirth || '',
                                    contactNumber: user.contactNumber || '',
                                    address: user.address || ''
                                })} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white">Reset</button>
                                
                                <button 
                                    onClick={handleSaveSettings} 
                                    disabled={saveSettingsStatus !== 'idle'}
                                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                                        saveSettingsStatus === 'saved' 
                                            ? 'bg-emerald-500 text-white' 
                                            : saveSettingsStatus === 'saving'
                                                ? 'bg-zinc-600 text-zinc-300'
                                                : 'bg-white text-black hover:bg-zinc-200'
                                    }`}
                                >
                                    {saveSettingsStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saveSettingsStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                                    {saveSettingsStatus === 'idle' ? 'Save Changes' : (saveSettingsStatus === 'saved' ? 'Saved' : 'Saving...')}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolio' && !isArtist && (
                         <div className="space-y-4">
                            <h3 className="text-lg font-medium mb-4 text-white">Your Inspiration</h3>
                            {savedTattoos.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No saved tattoos yet. Go explore!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {savedTattoos.map(t => (
                                        <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
                                            <img src={t.imageUrl} className="w-full h-full object-cover" />
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
            
            {/* Promo Generator Modal */}
            <AnimatePresence>
                {showPromoGen && isArtist && user.artistProfileId && (
                   <PromoGenerator 
                     artist={MOCK_ARTISTS.find(a => a.id === user.artistProfileId)!}
                     onClose={() => setShowPromoGen(false)}
                   />
                )}
            </AnimatePresence>

            {/* Create Post Modal */}
            <AnimatePresence>
              {showCreatePost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                   <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">New Portfolio Post</h3>
                        <button onClick={() => setShowCreatePost(false)}><XCircle className="text-zinc-500 hover:text-white" /></button>
                      </div>
                      <div className="space-y-4">
                         <div className="aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white/30 cursor-pointer transition-colors">
                            <IconImage className="w-10 h-10 mb-2" />
                            <span className="text-sm">Click to upload photo</span>
                         </div>
                         <div>
                           <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
                           <textarea 
                             value={newPostDesc}
                             onChange={(e) => setNewPostDesc(e.target.value)}
                             placeholder="E.g. Fresh healed mandala on the forearm..."
                             className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
                           />
                         </div>
                         <button onClick={handleCreatePost} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200">
                           Post to Feed
                         </button>
                      </div>
                   </motion.div>
                </div>
              )}
            </AnimatePresence>
        </motion.div>
    );
};
