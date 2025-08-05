// Enhanced gamification types

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special' | 'seasonal';
  category: 'skincare' | 'shopping' | 'social' | 'education';
  points: number;
  requirement: {
    type: 'count' | 'streak' | 'amount' | 'action';
    target: number;
    current?: number;
  };
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isCompleted?: boolean;
  completedAt?: string;
  multiplier?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlockedAt?: string;
  requirements: string[];
}

export interface VIPTier {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  color: string;
  benefits: string[];
  discountPercentage: number;
  exclusiveAccess: boolean;
  freeShipping: boolean;
  birthdayBonus: number;
  icon: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  backgroundImage?: string;
  challenges: Challenge[];
  exclusiveRewards: {
    badges: Badge[];
    bonusPoints: number;
    specialOffers: string[];
  };
  leaderboard?: {
    enabled: boolean;
    prizes: string[];
  };
}

export interface StreakBonus {
  days: number;
  multiplier: number;
  bonus: number;
  milestone: boolean;
  reward?: {
    type: 'points' | 'badge' | 'discount';
    value: any;
  };
}

export interface UserGamificationStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalChallengesCompleted: number;
  badges: Badge[];
  trophies: Trophy[];
  vipTier: VIPTier;
  seasonalParticipation: {
    eventId: string;
    progress: number;
    rank?: number;
  }[];
  achievements: {
    firstPurchase: boolean;
    referralMaster: boolean;
    reviewChampion: boolean;
    skincarePro: boolean;
    socialButterfly: boolean;
  };
}