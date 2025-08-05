export interface SpendingChallenge {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  type: 'routine_builder' | 'seasonal' | 'milestone' | 'bundle' | 'time_limited';
  category: 'skincare' | 'treatments' | 'luxury' | 'starter';
  
  // Challenge requirements
  requirements: {
    minSpend: number;
    timeLimit?: number; // days
    specificProducts?: string[]; // product IDs required
    minQuantity?: number;
    categories?: string[]; // must buy from these categories
  };
  
  // Progress tracking
  progress?: {
    currentSpend: number;
    completedRequirements: string[];
    timeRemaining?: number;
  };
  
  // Rewards
  rewards: {
    points: number;
    bonusPoints?: number;
    discount?: {
      percentage: number;
      maxAmount: number;
      validFor: number; // days
    };
    freeProducts?: string[];
    tierBoost?: {
      points: number;
      immediate: boolean;
    };
    exclusiveAccess?: string[];
    badge?: string;
  };
  
  // Business logic
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isCompleted?: boolean;
  completedAt?: string;
  
  // Marketing
  urgencyText?: string;
  popularityBoost?: boolean; // "Join 127 others in this challenge"
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedCompletion: string; // "2-3 weeks"
}

export interface UserSpendingProgress {
  userId: string;
  activeChallenges: {
    challengeId: string;
    startedAt: string;
    currentSpend: number;
    completedRequirements: string[];
    products: {
      productId: string;
      name: string;
      price: number;
      purchasedAt: string;
    }[];
  }[];
  completedChallenges: {
    challengeId: string;
    completedAt: string;
    finalSpend: number;
    rewardsEarned: any;
  }[];
  totalSpendingChallengePoints: number;
  currentStreak: number; // consecutive challenges completed
}

export interface SpendingBundle {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completionRate: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
    description?: string;
  }>;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  benefits: string[];
  challengeId?: string;
  isPopular?: boolean;
  isLimitedTime?: boolean;
  timeLeft?: number; // hours
  spotsLeft?: number;
  testimonial?: {
    name: string;
    text: string;
    rating: number;
  };
  score?: number; // Added by recommendation engine
  recommendationReason?: string; // Added by recommendation engine
  isRecommended?: boolean; // Added by recommendation engine
  associatedChallenge?: SpendingChallenge; // Added by API
}

export interface SpendingMilestone {
  id: string;
  title: string;
  description: string;
  spendAmount: number;
  reward: {
    type: 'points' | 'discount' | 'product' | 'tier_boost';
    value: any;
  };
  isAchieved?: boolean;
  achievedAt?: string;
}