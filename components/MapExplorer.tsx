import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Zap, Loader2, AlertCircle } from 'lucide-react';
import * as L from 'leaflet';
import { Profile } from '../types';

interface MapExplorerProps {
  artists: Profile[];
  onArtistSelect: (id: string) => void;
}

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
const ABQ_CENTER = { lat: 35.0844, lng: -106.6504 };

// CartoDB Dark Matter Tiles (Free, nice dark mode aesthetic)
const TILE_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MapExplorer: React.FC<MapExplorerProps> = ({ artists, onArtistSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [selectedArtist, setSelectedArtist] = useState<Profile | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [ABQ_CENTER.lat, ABQ_CENTER.lng],
      zoom: 13,
      zoomControl: false, // We will build custom UI
      attributionControl: false // We'll add a minimal one or rely on tiles
    });

    // Add Dark Tile Layer
    L.tileLayer(TILE_LAYER_URL, {
      maxZoom: 20,
      attribution: TILE_ATTRIBUTION
    }).addTo(map);
    
    // Add small attribution to bottom right manually if needed, or rely on Leaflet defaults (hidden via config above for clean UI)
    // For production legality, attribution should be visible, but for this design we keep it minimal.
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle User Location & FlyTo
  useEffect(() => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          
          if (mapInstanceRef.current) {
            // Add User Pulse Marker
            const userIcon = L.divIcon({
                className: 'bg-transparent',
                html: `<div class="relative flex h-6 w-6">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-500 border-2 border-white shadow-lg"></span>
                       </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            L.marker([pos.lat, pos.lng], { icon: userIcon })
             .addTo(mapInstanceRef.current)
             .bindPopup("You are here");

            mapInstanceRef.current.flyTo([pos.lat, pos.lng], 14, { duration: 2 });
          }
        },
        () => {
          console.warn("Geolocation permission denied or failed.");
        }
      );
    }
  }, []);

  // 3. Render Artist Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    artists.forEach((artist) => {
      const isAvailable = artist.availability === 'available_now';

      // Create Custom HTML Markers using Tailwind
      const activeHtml = `
        <div class="relative flex h-8 w-8 items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
        </div>
      `;

      const inactiveHtml = `
        <div class="relative flex h-4 w-4 items-center justify-center cursor-pointer hover:scale-110 transition-transform">
             <span class="relative inline-flex rounded-full h-3 w-3 bg-zinc-600 border border-zinc-500"></span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'bg-transparent',
        html: isAvailable ? activeHtml : inactiveHtml,
        iconSize: isAvailable ? [32, 32] : [16, 16],
        iconAnchor: isAvailable ? [16, 16] : [8, 8],
      });

      const marker = L.marker([artist.coordinates.lat, artist.coordinates.lng], { 
        icon: customIcon,
        title: artist.name 
      }).addTo(map);

      // Add click handler
      marker.on('click', () => {
        setSelectedArtist(artist);
        map.flyTo([artist.coordinates.lat, artist.coordinates.lng], 15, { duration: 1.5 });
      });

      markersRef.current.push(marker);
    });

  }, [artists]); // Re-run if artists list changes

  return (
    <div className="relative w-full h-[60vh] rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-900">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Custom Overlay Controls */}
      <div className="absolute top-4 left-4 z-[400]">
         <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide font-display">
              {artists.filter(a => a.availability === 'available_now').length} STUDIOS OPEN FOR WALK-INS
            </span>
         </div>
      </div>

      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
         <button 
           onClick={() => {
             if (userLocation && mapInstanceRef.current) {
               mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.5 });
             }
           }}
           className="p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors shadow-lg group"
         >
            <Navigation className="w-5 h-5 group-active:scale-90 transition-transform" />
         </button>
      </div>

      {/* Selected Artist Card Overlay */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6 z-[400]"
          >
            <div className="bg-surface/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
               <img src={selectedArtist.avatarUrl} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
               <div className="flex-1">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2 font-display">
                    {selectedArtist.name}
                    {selectedArtist.verified && <div className="text-blue-400"><Zap className="w-4 h-4 fill-current" /></div>}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className={selectedArtist.availability === 'available_now' ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {selectedArtist.availability === 'available_now' ? 'Walk-in Available' : 'Appointment Only'}
                    </span>
                    <span>•</span>
                    <span>{selectedArtist.distance || 'Nearby'}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                   <button 
                     onClick={() => onArtistSelect(selectedArtist.id)}
                     className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg"
                   >
                     View Profile
                   </button>
                   <button 
                     onClick={() => setSelectedArtist(null)}
                     className="p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-colors"
                   >
                     Close
                   </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapExplorer;