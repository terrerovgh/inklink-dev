
export enum UserRole {
  CLIENT = 'client',
  ARTIST = 'artist'
}

export interface UserPreferences {
  styles: string[];
  maxBudget?: number;
  notifications: boolean;
  location?: string;
}

export interface User {
  id: string;
  googleId?: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  preferences?: UserPreferences;
  savedTattooIds: string[];
  artistProfileId?: string; // If user is also an artist
}

export interface Profile {
  id: string;
  userId?: string; // Link to auth user
  role: UserRole;
  name: string;
  handle: string;
  bio: string;
  location: string;
  coordinates: { lat: number; lng: number };
  distance?: string;
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
  socials?: {
    instagram?: string;
    website?: string;
  };
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
  isFeatured?: boolean; // Pinned/Best Work
  status?: 'healed' | 'fresh' | 'in_progress';
  completionTime?: string;
  images?: string[];
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  bodyZone: BodyZone;
  style: string;
  budgetEstimate: { min: number; max: number };
  generatedSketchUrl?: string; // AI Sketch
  referenceImages: string[];
  userPhotoUrl?: string; // For Virtual Try-On
  status: 'draft' | 'published' | 'in_progress' | 'completed';
  createdAt: string;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  projectId: string;
  artistId: string;
  artistName: string;
  amount: number;
  message: string;
  estimatedHours: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type BodyZone = 'arm_upper' | 'arm_lower' | 'chest' | 'back' | 'leg_upper' | 'leg_lower' | 'neck' | 'hand' | 'ribs' | 'other';

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
  status: 'pending' | 'confirmed' | 'completed' | 'declined';
  type: 'Consultation' | 'Session' | 'Touch-up';
  depositPaid?: boolean;
  priceEstimate?: number;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  name?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isMe: boolean;
  attachments?: Attachment[];
}
