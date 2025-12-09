
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data Generators
const MOCK_CLIENT: User = {
  id: 'c_123',
  googleId: 'g_client_1',
  email: 'elena.garcia@gmail.com',
  name: 'Elena Garcia',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  role: UserRole.CLIENT,
  savedTattooIds: ['1', '3'],
  preferences: {
    styles: ['Fine Line', 'Geometric'],
    notifications: true,
    location: 'Nob Hill, ABQ'
  }
};

const MOCK_ARTIST_USER: User = {
  id: 'u_artist_1',
  googleId: 'g_artist_1',
  email: 'studio@archetype.com',
  name: 'Archetype Studio',
  avatarUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=400&auto=format&fit=crop',
  role: UserRole.ARTIST,
  savedTattooIds: [],
  artistProfileId: 'a1' // Links to the profile in MOCK_ARTISTS
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('inklink_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    // Simulate Google Auth Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = role === UserRole.CLIENT ? MOCK_CLIENT : MOCK_ARTIST_USER;
    setUser(userData);
    localStorage.setItem('inklink_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inklink_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('inklink_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
