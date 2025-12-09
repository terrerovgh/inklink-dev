
import { Profile, UserRole, Tattoo, MarketRequest, Appointment } from '../types';

export const MOCK_ARTISTS: Profile[] = [
  {
    id: 'a1', role: UserRole.ARTIST, name: 'Archetype Tattoo', handle: '@archetype.abq',
    bio: "Located in the heart of Nob Hill. We specialize in custom large-scale work, fine line, and geometric patterning. Collective of award-winning artists.",
    location: 'Nob Hill, ABQ', coordinates: { lat: 35.0820, lng: -106.6050 }, distance: '0.4 mi', availability: 'booking_future',
    styleTags: ['Geometric', 'Blackwork', 'Fine Line'],
    pricing: { min: 150, hourly: 180 }, verified: true, rating: 4.9, reviewCount: 342,
    avatarUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=400&auto=format&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a2', role: UserRole.ARTIST, name: 'Por Vida Tattoo', handle: '@porvida.nm',
    bio: "New Mexico's premier shop for traditional Black & Grey and Chicano style lettering. Authentic roots in the 505 culture.",
    location: 'Downtown ABQ', coordinates: { lat: 35.0844, lng: -106.6504 }, distance: '2.1 mi', availability: 'available_now',
    styleTags: ['Black & Grey', 'Chicano', 'Lettering'],
    pricing: { min: 100, hourly: 150 }, verified: true, rating: 4.8, reviewCount: 890,
    avatarUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=400&auto=format&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a3', role: UserRole.ARTIST, name: 'True Grit', handle: '@truegrit.abq',
    bio: "Bold lines, bright colors. Specializing in American Traditional and Neo-Traditional. Walk-ins welcome every Friday.",
    location: 'Northeast Heights', coordinates: { lat: 35.1100, lng: -106.5500 }, distance: '4.5 mi', availability: 'available_now',
    styleTags: ['American Traditional', 'Old School', 'Color'],
    pricing: { min: 120, hourly: 160 }, verified: true, rating: 4.7, reviewCount: 210,
    avatarUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=400&auto=format&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a4', role: UserRole.ARTIST, name: 'Route 66 Fine Line', handle: '@rt66.fineline',
    bio: "Specializing in micro-realism and single needle delicate work. The go-to spot for intricate floral and anime pieces.",
    location: 'Central Ave, ABQ', coordinates: { lat: 35.0810, lng: -106.6200 }, distance: '1.2 mi', availability: 'booking_future',
    styleTags: ['Fine Line', 'Micro Realism', 'Anime'],
    pricing: { min: 200, hourly: 200 }, verified: true, rating: 5.0, reviewCount: 156,
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c23?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'a5', role: UserRole.ARTIST, name: 'Starry Ink', handle: '@starry.abq',
    bio: "Cosmic, watercolor, and abstract designs. Located near the University area.",
    location: 'University Blvd', coordinates: { lat: 35.0900, lng: -106.6150 }, distance: '0.8 mi', availability: 'available_now',
    styleTags: ['Watercolor', 'Abstract', 'Cosmic'],
    pricing: { min: 140, hourly: 140 }, verified: false, rating: 4.6, reviewCount: 45,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverUrl: 'https://images.unsplash.com/photo-1525439722822-29729a674172?q=80&w=2000&auto=format&fit=crop'
  }
];

export const MOCK_TATTOOS: Tattoo[] = [
  { 
    id: '1', artistId: 'a1', artistName: 'Archetype Tattoo', artistAvatar: MOCK_ARTISTS[0].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1560707303-4e9803d165df?q=80&w=800&auto=format&fit=crop', 
    style: 'Geometric', bodyPart: 'Forearm', description: 'Sacred geometry sleeve', likes: 243, tags: ['geometry', 'dotwork', 'blackwork'],
    styleTags: ['Geometric', 'Blackwork']
  },
  { 
    id: '2', artistId: 'a2', artistName: 'Por Vida Tattoo', artistAvatar: MOCK_ARTISTS[1].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1590246294305-9e342390317e?q=80&w=800&auto=format&fit=crop', 
    style: 'Black & Grey', bodyPart: 'Chest', description: 'Smile Now Cry Later', likes: 892, tags: ['chicano', 'masks', 'traditional'],
    styleTags: ['Black & Grey', 'Chicano'],
    isFlash: true, price: 350
  },
  { 
    id: '3', artistId: 'a4', artistName: 'Route 66 Fine Line', artistAvatar: MOCK_ARTISTS[3].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop', 
    style: 'Micro Realism', bodyPart: 'Wrist', description: 'Single needle rose', likes: 561, tags: ['rose', 'floral', 'fineline'],
    styleTags: ['Fine Line', 'Realism']
  },
  { 
    id: '4', artistId: 'a3', artistName: 'True Grit', artistAvatar: MOCK_ARTISTS[2].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop', 
    style: 'Traditional', bodyPart: 'Leg', description: 'Panther head', likes: 120, tags: ['panther', 'traditional', 'old school'],
    styleTags: ['American Traditional', 'Color'],
    isFlash: true, price: 200
  },
  { 
    id: '5', artistId: 'a4', artistName: 'Route 66 Fine Line', artistAvatar: MOCK_ARTISTS[3].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=800&auto=format&fit=crop', 
    style: 'Anime', bodyPart: 'Arm', description: 'Studio Ghibli Scene', likes: 884, tags: ['anime', 'ghibli', 'color'],
    styleTags: ['Anime', 'Illustrative']
  },
  { 
    id: '6', artistId: 'a1', artistName: 'Archetype Tattoo', artistAvatar: MOCK_ARTISTS[0].avatarUrl, 
    imageUrl: 'https://images.unsplash.com/photo-1550537687-c9135742ca59?q=80&w=800&auto=format&fit=crop', 
    style: 'Blackwork', bodyPart: 'Back', description: 'Abstract spinal flow', likes: 432, tags: ['abstract', 'blackwork', 'flow'],
    styleTags: ['Blackwork', 'Abstract']
  }
];

export const MOCK_REQUESTS: MarketRequest[] = [
  { 
    id: 'r1', clientId: 'c1', clientName: 'Elena G.', clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    title: 'Zia Symbol with Yucca', description: 'Looking for a minimalist Zia symbol incorporating yucca flowers. Placing it on my ankle. Approx 3 inches.', 
    budgetRange: '$150 - $250', location: 'Nob Hill', style: 'Fine Line', status: 'open', createdAt: '2h ago', bids: 3,
    bodyPart: 'Leg Lower', generatedSketch: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=300',
    estimatedHours: 2,
    referenceImages: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300']
  },
  { 
    id: 'r2', clientId: 'c2', clientName: 'Marcus T.', clientAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    title: 'Breaking Bad Heisenberg Portrait', description: 'Realistic black and grey portrait for my calf. Want high detail.', 
    budgetRange: '$800 - $1200', location: 'Westside', style: 'Realism', status: 'open', createdAt: '5h ago', bids: 12,
    bodyPart: 'Leg Upper',
    estimatedHours: 6
  },
  { 
    id: 'r3', clientId: 'c3', clientName: 'Sarah M.', clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    title: 'Balloon Fiesta Scene', description: 'Colorful hot air balloons over the Sandias. Watercolor style.', 
    budgetRange: '$400 - $600', location: 'Northeast Heights', style: 'Watercolor', status: 'open', createdAt: '1d ago', bids: 5,
    bodyPart: 'Back', generatedSketch: 'https://images.unsplash.com/photo-1525439722822-29729a674172?auto=format&fit=crop&q=80&w=300',
    estimatedHours: 4
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'ap1', clientName: 'Elena G.', artistName: 'Archetype Tattoo', date: 'Oct 24', time: '14:00', status: 'confirmed', type: 'Session', depositPaid: true, priceEstimate: 450 },
  { id: 'ap2', clientName: 'Marcus T.', artistName: 'Por Vida Tattoo', date: 'Oct 25', time: '10:00', status: 'pending', type: 'Consultation', depositPaid: false },
];
