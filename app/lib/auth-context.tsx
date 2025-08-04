"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  loyaltyTier?: string;
  totalPoints?: number;
  currentStreak?: number;
  totalSpent?: number;
  phorestClientId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  isLoading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('skinSocieteUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('skinSocieteUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo purposes - in production, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock user data based on email
      const isJosh = email.toLowerCase().includes('josh');
      const mockUser: AuthUser = {
        id: isJosh ? 'josh-mills' : Math.random().toString(36).substr(2, 9),
        email: email,
        firstName: isJosh ? 'Josh' : 'Beauty',
        lastName: isJosh ? 'Mills' : 'Lover',
        loyaltyTier: isJosh ? 'VIP Goddess' : 'Glow Starter',
        totalPoints: isJosh ? 2450 : 150,
        currentStreak: isJosh ? 7 : 2,
        totalSpent: isJosh ? 2850.00 : 89.95
      };
      
      // Try to find existing Phorest client by email
      try {
        const phorestService = await import('../services/phorestService.js');
        const service = phorestService.default;
        
        const phorestClients = await service.searchClientByEmail(email);
        if (phorestClients.length > 0) {
          mockUser.phorestClientId = phorestClients[0].clientId;
          console.log('✅ Linked to existing Phorest client:', mockUser.phorestClientId);
        }
      } catch (phorestError) {
        console.warn('⚠️ Could not search Phorest clients:', phorestError);
      }
      
      setUser(mockUser);
      localStorage.setItem('skinSocieteUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        loyaltyTier: 'Glow Starter',
        totalPoints: 100, // Welcome bonus points
        currentStreak: 1,
        totalSpent: 0
      };
      
      // Create client in Phorest system
      try {
        const phorestService = await import('../services/phorestService.js');
        const service = phorestService.default;
        
        const phorestClient = await service.createClient({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          notes: `Created via Skin Societé app on ${new Date().toISOString()}`
        });
        
        console.log('✅ Phorest client created:', phorestClient.clientId);
        
        // Store Phorest client ID with user data
        newUser.phorestClientId = phorestClient.clientId;
        
      } catch (phorestError) {
        console.warn('⚠️ Could not create Phorest client:', phorestError);
        // Continue with signup even if Phorest fails
      }
      
      setUser(newUser);
      localStorage.setItem('skinSocieteUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('skinSocieteUser');
    // Force page reload to ensure clean state
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('skinSocieteUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}