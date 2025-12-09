
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Upload, ArrowRight, ArrowLeft, Camera, 
  Layers, FileText, Loader2, RotateCcw,
  Move, Maximize2, Trash2, Save
} from 'lucide-react';
import BodySelector from './BodySelector';
import { generateTattooDesign, generateProjectReport } from '../services/geminiService';

interface TattooStudioProps {
  onComplete: (projectData: any) => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: 'Concept & Ref', icon: Layers },
  { id: 2, title: 'Placement', icon: Move },
  { id: 3, title: 'AI Design', icon: Sparkles },
  { id: 4, title: 'Virtual Try-On', icon: Camera },
  { id: 5, title: 'Review', icon: FileText },
];

const STORAGE_KEY = 'inklink_studio_draft';

const TattooStudio: React.FC<TattooStudioProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  
  // Project State
  const [concept, setConcept] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [bodyZone, setBodyZone] = useState<string | null>(null);
  const [generatedSketch, setGeneratedSketch] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  // Try On Transform State
  const [overlayPos, setOverlayPos] = useState({ x: 50, y: 50, scale: 1, rotation: 0 });

  // 1. Load Draft on Mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const draft = JSON.parse(saved);
            setConcept(draft.concept || '');
            setReferences(draft.references || []);
            setBodyZone(draft.bodyZone || null);
            setGeneratedSketch(draft.generatedSketch || null);
            setUserPhoto(draft.userPhoto || null);
            setReport(draft.report || null);
            setOverlayPos(draft.overlayPos || { x: 50, y: 50, scale: 1, rotation: 0 });
            setCurrentStep(draft.currentStep || 1);
            setDraftLoaded(true);
            
            // Hide toast after 3s
            setTimeout(() => setDraftLoaded(false), 3000);
        } catch (e) {
            console.error("Failed to load draft", e);
        }
    }
  }, []);

  // 2. Auto-Save on Change
  useEffect(() => {
    // Debounce slightly to avoid thrashing storage on every keystroke
    const timer = setTimeout(() => {
        const draft = {
            currentStep,
            concept,
            references,
            bodyZone,
            generatedSketch,
            userPhoto,
            report,
            overlayPos
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn("Storage quota exceeded, could not auto-save draft.");
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentStep, concept, references, bodyZone, generatedSketch, userPhoto, report, overlayPos]);

  const clearDraft = () => {
      localStorage.removeItem(STORAGE_KEY);
      setConcept('');
      setReferences([]);
      setBodyZone(null);
      setGeneratedSketch(null);
      setUserPhoto(null);
      setReport(null);
      setCurrentStep(1);
      setOverlayPos({ x: 50, y: 50, scale: 1, rotation: 0 });
  };

  const handleNext = async () => {
    if (currentStep === 3 && !generatedSketch) {
        setIsProcessing(true);
        const sketch = await generateTattooDesign(concept, bodyZone || 'skin');
        setGeneratedSketch(sketch);
        setIsProcessing(false);
    } 
    else if (currentStep === 4 && !report) {
        setIsProcessing(true);
        const reportData = await generateProjectReport(concept, bodyZone || 'skin');
        setReport(reportData);
        setIsProcessing(false);
    }

    if (currentStep < 5) {
        setCurrentStep(c => c + 1);
    } else {
        // Complete
        localStorage.removeItem(STORAGE_KEY); // Clear draft on success
        onComplete({ concept, references, bodyZone, generatedSketch, report, userPhoto });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
    else onCancel(); // Does not clear draft, allowing resume later
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ref' | 'user') => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (type === 'ref') setReferences(prev => [...prev, ev.target?.result as string]);
            else setUserPhoto(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
       {/* Wizard Header */}
       <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"><ArrowLeft /></button>
             <h2 className="font-display font-bold text-xl">New Project</h2>
             {draftLoaded && (
                 <motion.span initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                     <Save className="w-3 h-3" /> Draft Restored
                 </motion.span>
             )}
          </div>
          <div className="flex items-center gap-4">
             {/* Progress Steps (Desktop) */}
             <div className="hidden md:flex gap-2">
                {steps.map((s) => (
                    <div key={s.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${currentStep === s.id ? 'bg-white text-black' : 'text-zinc-600'}`}>
                    <s.icon className="w-3 h-3" />
                    <span>{s.title}</span>
                    </div>
                ))}
             </div>
             
             {/* Reset Button */}
             {(concept || currentStep > 1) && (
                 <button 
                    onClick={() => {
                        if(window.confirm('Start over? This will clear your current draft.')) {
                            clearDraft();
                        }
                    }} 
                    className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 font-medium transition-colors"
                 >
                     <Trash2 className="w-3 h-3" /> Reset
                 </button>
             )}
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-4xl">
             <AnimatePresence mode="wait">
                
                {/* STEP 1: CONCEPT */}
                {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h1 className="text-3xl font-display font-bold text-white">Describe your vision</h1>
                        <textarea 
                           value={concept}
                           onChange={(e) => setConcept(e.target.value)}
                           className="w-full h-40 bg-surface/50 border border-white/10 rounded-2xl p-6 text-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                           placeholder="E.g. A geometric wolf head with floral accents, minimalist style..."
                        />
                        <div>
                           <label className="block text-sm font-medium text-zinc-400 mb-3">Reference Images (Optional)</label>
                           <div className="flex gap-4 overflow-x-auto pb-2">
                              {references.map((ref, i) => (
                                 <div key={i} className="relative group">
                                     <img src={ref} className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                                     <button 
                                        onClick={() => setReferences(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <Trash2 className="w-3 h-3" />
                                     </button>
                                 </div>
                              ))}
                              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all flex-shrink-0">
                                 <Upload className="w-6 h-6 mb-1" />
                                 <span className="text-[10px]">Upload</span>
                                 <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'ref')} />
                              </label>
                           </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: BODY PLACEMENT */}
                {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                        <h1 className="text-3xl font-display font-bold text-white">Where does it go?</h1>
                        <p className="text-zinc-400">Select the zone for the best AI fit estimation.</p>
                        <BodySelector selectedZone={bodyZone} onSelect={setBodyZone} />
                    </motion.div>
                )}

                {/* STEP 3: AI GENERATION */}
                {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h1 className="text-3xl font-display font-bold text-white text-center">Generating Stencil...</h1>
                        <div className="aspect-square max-w-md mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden relative shadow-2xl">
                           {isProcessing ? (
                               <div className="text-center">
                                  <Loader2 className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
                                  <p className="text-black font-medium">Gemini is sketching...</p>
                               </div>
                           ) : generatedSketch ? (
                               <img src={generatedSketch} className="w-full h-full object-contain p-8" />
                           ) : (
                               <div className="text-black/50">Ready to Generate</div>
                           )}
                           
                           {/* Stencil Grid Overlay */}
                           <div className="absolute inset-0 pointer-events-none opacity-10" 
                                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                           />
                        </div>
                        <p className="text-center text-zinc-500 text-sm">Note: This is a rough concept sketch for the artist.</p>
                        {generatedSketch && (
                            <div className="flex justify-center">
                                <button 
                                    onClick={() => { setGeneratedSketch(null); handleNext(); }} 
                                    className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    <RotateCcw className="w-3 h-3" /> Regenerate
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 4: VIRTUAL TRY-ON */}
                {currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h1 className="text-3xl font-display font-bold text-white text-center">Virtual Try-On</h1>
                        
                        <div className="relative aspect-[3/4] max-w-sm mx-auto bg-zinc-800 rounded-2xl overflow-hidden border border-white/10">
                           {userPhoto ? (
                              <div className="relative w-full h-full">
                                 <img src={userPhoto} className="w-full h-full object-cover" />
                                 {/* Draggable Tattoo Overlay */}
                                 {generatedSketch && (
                                     <div 
                                        className="absolute cursor-move mix-blend-multiply border border-dashed border-white/30 hover:border-white/60 transition-colors"
                                        style={{ 
                                            top: `${overlayPos.y}%`, left: `${overlayPos.x}%`, 
                                            transform: `translate(-50%, -50%) scale(${overlayPos.scale}) rotate(${overlayPos.rotation}deg)`,
                                            width: '50%'
                                        }}
                                     >
                                         <img src={generatedSketch} className="w-full filter contrast-125" style={{ mixBlendMode: 'multiply' }} />
                                     </div>
                                 )}
                              </div>
                           ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-700 transition-colors">
                                  <Camera className="w-12 h-12 text-zinc-500 mb-2" />
                                  <span className="text-zinc-400 font-bold">Upload Photo</span>
                                  <span className="text-xs text-zinc-500">Take a photo of your {bodyZone}</span>
                                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'user')} />
                              </label>
                           )}
                        </div>

                        {userPhoto && (
                            <div className="bg-surface/50 p-4 rounded-xl flex justify-center gap-6">
                                <button onClick={() => setOverlayPos(p => ({...p, rotation: p.rotation - 45}))} className="p-2 hover:bg-white/10 rounded"><RotateCcw className="w-5 h-5" /></button>
                                <button onClick={() => setOverlayPos(p => ({...p, scale: p.scale + 0.1}))} className="p-2 hover:bg-white/10 rounded"><Maximize2 className="w-5 h-5" /></button>
                                <button onClick={() => setUserPhoto(null)} className="p-2 hover:bg-white/10 rounded text-red-400">Reset Photo</button>
                            </div>
                        )}
                        <p className="text-center text-xs text-zinc-500">Drag to position. Use controls to rotate/scale.</p>
                    </motion.div>
                )}

                {/* STEP 5: REPORT & PUBLISH */}
                {currentStep === 5 && report && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold font-display uppercase tracking-tight">Project Spec</h2>
                                    <p className="text-zinc-500 text-sm">Generated by InkLink Intelligence</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-mono">${report.priceMin} - ${report.priceMax}</div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase">Est. Budget</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Technical</h4>
                                    <ul className="space-y-2 text-sm font-medium">
                                        <li className="flex justify-between border-b border-zinc-100 pb-1">
                                            <span>Est. Time</span> <span>{report.estimatedHours} Hours</span>
                                        </li>
                                        <li className="flex justify-between border-b border-zinc-100 pb-1">
                                            <span>Placement</span> <span className="capitalize">{bodyZone}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-zinc-100 pb-1">
                                            <span>Style</span> <span>Line Work / Stencil</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Artist Notes</h4>
                                    <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg leading-relaxed italic">
                                        "{report.technicalNotes}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {generatedSketch && (
                                    <div className="w-1/3 bg-zinc-100 rounded-lg p-2 border border-zinc-200">
                                        <img src={generatedSketch} className="w-full h-auto mix-blend-multiply" />
                                        <p className="text-[10px] text-center mt-1 text-zinc-400">Generated Stencil</p>
                                    </div>
                                )}
                                {userPhoto && (
                                     <div className="w-1/3 bg-zinc-100 rounded-lg p-2 border border-zinc-200 overflow-hidden relative">
                                        <img src={userPhoto} className="w-full h-full object-cover" />
                                        <p className="text-[10px] text-center mt-1 text-zinc-400">Mockup</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-zinc-500 mb-4 text-sm">Publishing will allow local artists to bid on your project.</p>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
       </div>

       {/* Footer Actions */}
       <div className="p-6 border-t border-white/10 bg-surface/50 backdrop-blur-md flex justify-between items-center">
          <button onClick={handleBack} disabled={isProcessing} className="px-6 py-3 rounded-xl text-zinc-400 hover:text-white font-medium">
             Back
          </button>
          <button 
             onClick={handleNext} 
             disabled={(!concept && currentStep === 1) || (!bodyZone && currentStep === 2) || isProcessing}
             className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
             {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
             {currentStep === 5 ? 'Publish to Marketplace' : 'Next Step'}
             {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </button>
       </div>
    </div>
  );
};

export default TattooStudio;
