import { Challenge, SeasonalEvent, VIPTier, Badge, Trophy } from '@/app/types/gamification';

// Daily challenges that rotate
export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'morning_routine',
    title: 'Morning Glow',
    description: 'Complete your morning skincare routine',
    icon: '🌅',
    type: 'daily',
    category: 'skincare',
    points: 25,
    requirement: {
      type: 'action',
      target: 1,
    },
    isActive: true,
  },
  {
    id: 'evening_routine',
    title: 'Night Ritual',
    description: 'Complete your evening skincare routine',
    icon: '🌙',
    type: 'daily',
    category: 'skincare',
    points: 30,
    requirement: {
      type: 'action',
      target: 1,
    },
    isActive: true,
  },
  {
    id: 'product_learn',
    title: 'Knowledge Seeker',
    description: 'Read about a skincare ingredient',
    icon: '📚',
    type: 'daily',
    category: 'education',
    points: 20,
    requirement: {
      type: 'action',
      target: 1,
    },
    isActive: true,
  },
  {
    id: 'water_intake',
    title: 'Hydration Hero',
    description: 'Log drinking 8 glasses of water',
    icon: '💧',
    type: 'daily',
    category: 'skincare',
    points: 15,
    requirement: {
      type: 'count',
      target: 8,
    },
    isActive: true,
  },
  {
    id: 'photo_progress',
    title: 'Progress Tracker',
    description: 'Take a skincare progress photo',
    icon: '📸',
    type: 'daily',
    category: 'skincare',
    points: 35,
    requirement: {
      type: 'action',
      target: 1,
    },
    isActive: true,
  },
];

// Weekly challenges
export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'streak_master',
    title: 'Consistency Champion',
    description: 'Complete daily routine 5 days this week',
    icon: '🔥',
    type: 'weekly',
    category: 'skincare',
    points: 200,
    requirement: {
      type: 'count',
      target: 5,
    },
    isActive: true,
  },
  {
    id: 'product_explorer',
    title: 'Product Explorer',
    description: 'Try 3 different product types',
    icon: '🧪',
    type: 'weekly',
    category: 'shopping',
    points: 150,
    requirement: {
      type: 'count',
      target: 3,
    },
    isActive: true,
  },
  {
    id: 'social_sharer',
    title: 'Beauty Influencer',
    description: 'Share your routine on social media',
    icon: '📱',
    type: 'weekly',
    category: 'social',
    points: 100,
    requirement: {
      type: 'action',
      target: 1,
    },
    isActive: true,
  },
];

// VIP Tier System
export const VIP_TIERS: VIPTier[] = [
  {
    id: 'glow_starter',
    name: 'Glow Starter',
    level: 1,
    minPoints: 0,
    color: '#94a3b8',
    benefits: ['Welcome bonus', 'Basic rewards'],
    discountPercentage: 0,
    exclusiveAccess: false,
    freeShipping: false,
    birthdayBonus: 50,
    icon: '✨',
  },
  {
    id: 'beauty_enthusiast',
    name: 'Beauty Enthusiast',
    level: 2,
    minPoints: 500,
    color: '#10b981',
    benefits: ['5% discount', 'Priority support', 'Early access'],
    discountPercentage: 5,
    exclusiveAccess: false,
    freeShipping: false,
    birthdayBonus: 100,
    icon: '🌟',
  },
  {
    id: 'skincare_guru',
    name: 'Skincare Guru',
    level: 3,
    minPoints: 1000,
    color: '#8b5cf6',
    benefits: ['10% discount', 'Free shipping', 'Exclusive products'],
    discountPercentage: 10,
    exclusiveAccess: true,
    freeShipping: true,
    birthdayBonus: 200,
    icon: '💎',
  },
  {
    id: 'vip_goddess',
    name: 'VIP Goddess',
    level: 4,
    minPoints: 2000,
    color: '#f59e0b',
    benefits: ['15% discount', 'VIP events', 'Personal consultant'],
    discountPercentage: 15,
    exclusiveAccess: true,
    freeShipping: true,
    birthdayBonus: 500,
    icon: '👑',
  },
];

// Badges collection
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_purchase',
    name: 'First Steps',
    description: 'Made your first purchase',
    icon: '🛍️',
    rarity: 'common',
    category: 'shopping',
  },
  {
    id: 'streak_week',
    name: 'Week Warrior',
    description: 'Maintained routine for 7 days',
    icon: '🗡️',
    rarity: 'common',
    category: 'consistency',
  },
  {
    id: 'streak_month',
    name: 'Monthly Master',
    description: 'Maintained routine for 30 days',
    icon: '🏆',
    rarity: 'rare',
    category: 'consistency',
  },
  {
    id: 'big_spender',
    name: 'Beauty Collector',
    description: 'Spent over $500',
    icon: '💰',
    rarity: 'rare',
    category: 'shopping',
  },
  {
    id: 'referral_master',
    name: 'Friend Magnet',
    description: 'Referred 5 friends',
    icon: '🤝',
    rarity: 'epic',
    category: 'social',
  },
  {
    id: 'review_champion',
    name: 'Review Queen',
    description: 'Left 10 product reviews',
    icon: '⭐',
    rarity: 'rare',
    category: 'social',
  },
  {
    id: 'early_bird',
    name: 'Dawn Warrior',
    description: 'Completed morning routine before 7AM',
    icon: '🐦',
    rarity: 'common',
    category: 'routine',
  },
  {
    id: 'night_owl',
    name: 'Midnight Maven',
    description: 'Completed evening routine after 10PM',
    icon: '🦉',
    rarity: 'common',
    category: 'routine',
  },
  {
    id: 'ingredient_expert',
    name: 'Skin Scholar',
    description: 'Learned about 20 ingredients',
    icon: '🔬',
    rarity: 'epic',
    category: 'education',
  },
  {
    id: 'perfectionist',
    name: 'Flawless Streak',
    description: 'Perfect routine for 100 days',
    icon: '💯',
    rarity: 'legendary',
    category: 'consistency',
  },
];

// Trophies for major achievements
export const AVAILABLE_TROPHIES: Trophy[] = [
  {
    id: 'bronze_commitment',
    name: 'Bronze Dedication',
    description: 'Complete 30 challenges',
    icon: '🥉',
    tier: 'bronze',
    points: 500,
    requirements: ['Complete 30 challenges'],
  },
  {
    id: 'silver_commitment',
    name: 'Silver Dedication',
    description: 'Complete 100 challenges',
    icon: '🥈',
    tier: 'silver',
    points: 1000,
    requirements: ['Complete 100 challenges'],
  },
  {
    id: 'gold_commitment',
    name: 'Gold Dedication',
    description: 'Complete 250 challenges',
    icon: '🥇',
    tier: 'gold',
    points: 2000,
    requirements: ['Complete 250 challenges'],
  },
  {
    id: 'platinum_master',
    name: 'Platinum Master',
    description: 'Reach VIP Goddess tier',
    icon: '🏆',
    tier: 'platinum',
    points: 5000,
    requirements: ['Reach VIP Goddess tier', 'Complete 500 challenges'],
  },
];

// Helper functions
export function getDailyChallenges(date: Date = new Date()): Challenge[] {
  // Rotate challenges based on day of week
  const dayOfWeek = date.getDay();
  const challengesPerDay = 3;
  const startIndex = (dayOfWeek * challengesPerDay) % DAILY_CHALLENGES.length;
  
  return DAILY_CHALLENGES.slice(startIndex, startIndex + challengesPerDay)
    .concat(DAILY_CHALLENGES.slice(0, Math.max(0, (startIndex + challengesPerDay) - DAILY_CHALLENGES.length)));
}

export function getVIPTierByPoints(points: number): VIPTier {
  return VIP_TIERS
    .filter(tier => points >= tier.minPoints)
    .sort((a, b) => b.minPoints - a.minPoints)[0] || VIP_TIERS[0];
}

export function getNextVIPTier(currentPoints: number): VIPTier | null {
  return VIP_TIERS.find(tier => tier.minPoints > currentPoints) || null;
}

export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 100) return 5.0; // 5x multiplier
  if (streakDays >= 50) return 3.0;  // 3x multiplier
  if (streakDays >= 30) return 2.0;  // 2x multiplier
  if (streakDays >= 14) return 1.5;  // 1.5x multiplier
  if (streakDays >= 7) return 1.2;   // 1.2x multiplier
  return 1.0; // No bonus
}

// Current seasonal event (example)
export const CURRENT_SEASONAL_EVENT: SeasonalEvent = {
  id: 'summer_glow_2024',
  name: 'Summer Glow Challenge',
  description: 'Achieve your best summer skin with daily challenges and exclusive rewards',
  theme: 'summer',
  startDate: '2024-12-01',
  endDate: '2024-12-31',
  backgroundImage: '/seasonal/summer-glow.jpg',
  challenges: [
    {
      id: 'spf_champion',
      title: 'SPF Champion',
      description: 'Apply sunscreen daily for 7 days',
      icon: '☀️',
      type: 'seasonal',
      category: 'skincare',
      points: 300,
      requirement: {
        type: 'streak',
        target: 7,
      },
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      isActive: true,
      multiplier: 2.0,
    },
  ],
  exclusiveRewards: {
    badges: [
      {
        id: 'summer_goddess',
        name: 'Summer Goddess',
        description: 'Mastered summer skincare',
        icon: '🌞',
        rarity: 'legendary',
        category: 'seasonal',
      },
    ],
    bonusPoints: 1000,
    specialOffers: ['20% off sun protection products'],
  },
  leaderboard: {
    enabled: true,
    prizes: ['$100 gift card', '$50 gift card', '$25 gift card'],
  },
};