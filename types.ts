
export enum UserRole {
  CLIENT = 'client',
  ARTIST = 'artist'
}

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  handle: string;
  bio: string;
  location: string;
  coordinates: { lat: number; lng: number };
  distance?: string; // Calculated distance from user
  availability: 'available_now' | 'booking_future' | 'closed';
  styleTags: string[];
  pricing: {
    min: number;
    hourly: number;
  };
  avatarUrl: string;
  coverUrl: string;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Tattoo {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  imageUrl: string;
  style: string;
  bodyPart: string;
  description: string;
  price?: number;
  likes: number;
  tags?: string[];
  styleTags?: string[];
  isFlash?: boolean;
}

export interface MarketRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  title: string;
  description: string;
  budgetRange: string;
  location: string;
  style: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  referenceImages?: string[];
  bids?: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  artistName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  type: 'Consultation' | 'Session' | 'Touch-up';
  depositPaid?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isMe: boolean;
}