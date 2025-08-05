import { SpendingChallenge, SpendingBundle, SpendingMilestone } from '@/app/types/spending-challenges';

// Active spending challenges
export const SPENDING_CHALLENGES: SpendingChallenge[] = [
  {
    id: 'routine_builder_basic',
    title: 'Complete Your Routine',
    description: 'Build a complete skincare routine with cleanser, serum, and moisturizer. Get bonus points and free travel sizes!',
    shortDescription: 'Cleanser + Serum + Moisturizer',
    icon: '🧴',
    type: 'routine_builder',
    category: 'starter',
    requirements: {
      minSpend: 120,
      categories: ['cleansers', 'serums', 'moisturizers'],
      minQuantity: 3,
    },
    rewards: {
      points: 500,
      bonusPoints: 200,
      freeProducts: ['travel-cleanser', 'travel-serum'],
      badge: 'routine_master',
    },
    isActive: true,
    difficulty: 'easy',
    estimatedCompletion: '1-2 weeks',
    urgencyText: 'Popular this week!',
    popularityBoost: true,
  },
  {
    id: 'glow_up_quarterly',
    title: 'Quarterly Glow Up',
    description: 'Invest in your skin this quarter! Spend $200 in 90 days and unlock VIP benefits plus exclusive products.',
    shortDescription: 'Spend $200 in 90 days',
    icon: '✨',
    type: 'seasonal',
    category: 'skincare',
    requirements: {
      minSpend: 200,
      timeLimit: 90,
    },
    rewards: {
      points: 1000,
      tierBoost: {
        points: 300,
        immediate: true,
      },
      discount: {
        percentage: 20,
        maxAmount: 50,
        validFor: 30,
      },
      exclusiveAccess: ['premium-serum-collection'],
    },
    isActive: true,
    difficulty: 'medium',
    estimatedCompletion: '2-3 months',
    maxParticipants: 100,
    currentParticipants: 67,
  },
  {
    id: 'luxury_experience',
    title: 'Luxury Skincare Experience',
    description: 'Treat yourself to premium products worth $300+. Unlock VIP Goddess tier instantly and get personal consultation.',
    shortDescription: 'Premium products $300+',
    icon: '💎',
    type: 'milestone',
    category: 'luxury',
    requirements: {
      minSpend: 300,
      categories: ['premium', 'luxury'],
      timeLimit: 30,
    },
    rewards: {
      points: 1500,
      tierBoost: {
        points: 500,
        immediate: true,
      },
      exclusiveAccess: ['personal-consultation', 'vip-events'],
      badge: 'luxury_connoisseur',
    },
    isActive: true,
    difficulty: 'expert',
    estimatedCompletion: '1 month',
    urgencyText: 'Only 15 spots left!',
    maxParticipants: 50,
    currentParticipants: 35,
  },
  {
    id: 'acne_solution_bundle',
    title: 'Clear Skin Solution',
    description: 'Target acne with our curated collection. Complete the bundle and get 25% off your next acne treatment.',
    shortDescription: 'Acne-fighting bundle',
    icon: '🎯',
    type: 'bundle',
    category: 'skincare',
    requirements: {
      minSpend: 150,
      specificProducts: ['salicylic-cleanser', 'niacinamide-serum', 'acne-moisturizer'],
      minQuantity: 3,
    },
    rewards: {
      points: 750,
      discount: {
        percentage: 25,
        maxAmount: 75,
        validFor: 60,
      },
      freeProducts: ['acne-patches', 'spot-treatment'],
    },
    isActive: true,
    difficulty: 'medium',
    estimatedCompletion: '2-4 weeks',
    endDate: '2024-12-31',
  },
  {
    id: 'flash_weekend_boost',
    title: 'Weekend Flash Challenge',
    description: 'This weekend only! Spend $100 and get instant tier boost plus weekend-exclusive products.',
    shortDescription: 'Weekend exclusive - $100',
    icon: '⚡',
    type: 'time_limited',
    category: 'skincare',
    requirements: {
      minSpend: 100,
      timeLimit: 3, // 3 days
    },
    rewards: {
      points: 400,
      bonusPoints: 300,
      tierBoost: {
        points: 200,
        immediate: true,
      },
      exclusiveAccess: ['weekend-exclusive-kit'],
    },
    isActive: true,
    startDate: '2024-08-05',
    endDate: '2024-08-07',
    difficulty: 'easy',
    estimatedCompletion: '2-3 days',
    urgencyText: 'Ends Sunday night!',
    maxParticipants: 200,
    currentParticipants: 143,
  },
];

// Enhanced product bundles with smart recommendations
export const SPENDING_BUNDLES = [
  {
    id: 'complete_routine_starter',
    name: 'Complete Routine Starter Kit',
    description: 'Everything you need for healthy, glowing skin. Perfect for beginners starting their skincare journey.',
    category: 'routine-building',
    difficulty: 'beginner',
    completionRate: 87,
    products: [
      { id: 'gentle-cleanser', name: 'Gentle Daily Cleanser', price: 35, image: '/api/placeholder/80/80', category: 'cleanser', rating: 4.8 },
      { id: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', price: 45, image: '/api/placeholder/80/80', category: 'serum', rating: 4.9 },
      { id: 'daily-moisturizer', name: 'Daily Hydrating Moisturizer', price: 40, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.7 },
      { id: 'spf-sunscreen', name: 'Daily SPF 50 Sunscreen', price: 25, image: '/api/placeholder/80/80', category: 'sunscreen', rating: 4.6 },
    ],
    originalPrice: 145,
    bundlePrice: 119,
    savings: 26,
    challengeId: 'routine_builder_basic',
    benefits: ['Complete morning & evening routine', 'Gentle for all skin types', 'Visible results in 2-4 weeks', 'Perfect for beginners'],
    isPopular: true,
    testimonial: {
      name: 'Sarah M.',
      text: 'This kit transformed my skin in just 3 weeks! Perfect for someone who had no idea where to start.',
      rating: 5,
    },
  },
  {
    id: 'anti_aging_powerhouse',
    name: 'Anti-Aging Powerhouse Collection',
    description: 'Advanced anti-aging routine for visible results. Turn back time with clinically proven ingredients.',
    category: 'anti-aging',
    difficulty: 'advanced',
    completionRate: 78,
    products: [
      { id: 'retinol-serum', name: 'Advanced Retinol Serum', price: 85, image: '/api/placeholder/80/80', category: 'serum', rating: 4.9 },
      { id: 'peptide-cream', name: 'Peptide Recovery Cream', price: 95, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.8 },
      { id: 'eye-cream', name: 'Anti-Aging Eye Cream', price: 55, image: '/api/placeholder/80/80', category: 'eye-care', rating: 4.7 },
      { id: 'face-mask', name: 'Weekly Renewal Mask', price: 35, image: '/api/placeholder/80/80', category: 'mask', rating: 4.5 },
      { id: 'hyaluronic-serum', name: 'Hyaluronic Acid Serum', price: 50, image: '/api/placeholder/80/80', category: 'serum', rating: 4.8 },
    ],
    originalPrice: 320,
    bundlePrice: 270,
    savings: 50,
    benefits: ['Reduces fine lines & wrinkles', 'Firms and lifts skin', 'Intensive hydration', 'Professional-grade results'],
    isLimitedTime: true,
    timeLeft: 168, // 7 days in hours
    testimonial: {
      name: 'Jennifer K.',
      text: 'After 6 weeks, I look 5 years younger! The results speak for themselves.',
      rating: 5,
    },
  },
  {
    id: 'acne_solution_complete',
    name: 'Clear Skin Solution Bundle',
    description: 'Target breakouts with our dermatologist-approved acne-fighting collection.',
    category: 'acne',
    difficulty: 'intermediate',
    completionRate: 82,
    products: [
      { id: 'salicylic-cleanser', name: 'Salicylic Acid Cleanser', price: 28, image: '/api/placeholder/80/80', category: 'cleanser', rating: 4.6 },
      { id: 'niacinamide-serum', name: 'Niacinamide 10% Serum', price: 35, image: '/api/placeholder/80/80', category: 'serum', rating: 4.8 },
      { id: 'acne-moisturizer', name: 'Oil-Free Acne Moisturizer', price: 32, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.5 },
      { id: 'spot-treatment', name: 'Benzoyl Peroxide Spot Treatment', price: 18, image: '/api/placeholder/80/80', category: 'treatment', rating: 4.4 },
    ],
    originalPrice: 113,
    bundlePrice: 89,
    savings: 24,
    challengeId: 'acne_solution_bundle',
    benefits: ['Clear existing breakouts', 'Prevent future acne', 'Minimize pore appearance', 'Gentle yet effective'],
    spotsLeft: 45,
    testimonial: {
      name: 'Mike T.',
      text: 'Finally found a routine that works! My skin has never been clearer.',
      rating: 5,
    },
  },
  {
    id: 'hydration_rescue',
    name: 'Hydration Rescue Kit',
    description: 'Intensive moisture therapy for dry, dehydrated skin. Restore your natural glow.',
    category: 'hydration',
    difficulty: 'beginner',
    completionRate: 91,
    products: [
      { id: 'hydrating-cleanser', name: 'Hydrating Cream Cleanser', price: 30, image: '/api/placeholder/80/80', category: 'cleanser', rating: 4.7 },
      { id: 'hyaluronic-serum', name: 'Hyaluronic Acid Serum', price: 50, image: '/api/placeholder/80/80', category: 'serum', rating: 4.8 },
      { id: 'moisture-barrier-cream', name: 'Moisture Barrier Repair Cream', price: 55, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.9 },
      { id: 'hydrating-mask', name: 'Overnight Hydrating Mask', price: 25, image: '/api/placeholder/80/80', category: 'mask', rating: 4.6 },
    ],
    originalPrice: 160,
    bundlePrice: 129,
    savings: 31,
    benefits: ['24-hour hydration', 'Plumps fine lines', 'Restores skin barrier', 'Instant glow'],
    isPopular: true,
    testimonial: {
      name: 'Lisa W.',
      text: 'My skin went from dry and flaky to glowing and smooth in just one week!',
      rating: 5,
    },
  },
  {
    id: 'luxury_vip_collection',
    name: 'VIP Luxury Collection',
    description: 'Exclusive premium products for the ultimate skincare experience. VIP members only.',
    category: 'luxury',
    difficulty: 'expert',
    completionRate: 65,
    products: [
      { id: 'platinum-serum', name: 'Platinum Peptide Serum', price: 120, image: '/api/placeholder/80/80', category: 'serum', rating: 4.9 },
      { id: 'diamond-cream', name: 'Diamond Radiance Cream', price: 150, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.8 },
      { id: 'gold-eye-cream', name: '24K Gold Eye Treatment', price: 85, image: '/api/placeholder/80/80', category: 'eye-care', rating: 4.7 },
      { id: 'caviar-mask', name: 'Caviar Recovery Mask', price: 95, image: '/api/placeholder/80/80', category: 'mask', rating: 4.6 },
    ],
    originalPrice: 450,
    bundlePrice: 360,
    savings: 90,
    challengeId: 'luxury_experience',
    benefits: ['Instant visible lift', 'Red carpet ready skin', 'Professional spa results', 'Exclusive ingredients'],
    isLimitedTime: true,
    timeLeft: 72, // 3 days
    spotsLeft: 12,
    testimonial: {
      name: 'Alexandra R.',
      text: 'Pure luxury in a bottle. This collection makes me feel like royalty!',
      rating: 5,
    },
  },
  {
    id: 'weekend_glow_flash',
    name: 'Weekend Glow Flash Kit',
    description: 'Quick transformation for instant glow. Perfect for weekend plans and special events.',
    category: 'instant-glow',
    difficulty: 'easy',
    completionRate: 95,
    products: [
      { id: 'glow-serum', name: 'Instant Glow Serum', price: 42, image: '/api/placeholder/80/80', category: 'serum', rating: 4.7 },
      { id: 'illuminating-moisturizer', name: 'Illuminating Day Cream', price: 38, image: '/api/placeholder/80/80', category: 'moisturizer', rating: 4.6 },
      { id: 'glow-mask', name: '15-Minute Glow Mask', price: 22, image: '/api/placeholder/80/80', category: 'mask', rating: 4.8 },
    ],
    originalPrice: 102,
    bundlePrice: 79,
    savings: 23,
    challengeId: 'flash_weekend_boost',
    benefits: ['Instant radiance', 'Perfect for events', 'Easy 3-step routine', 'Quick visible results'],
    isLimitedTime: true,
    timeLeft: 48, // 2 days
    testimonial: {
      name: 'Emma S.',
      text: 'Got so many compliments at the wedding! This kit is magic.',
      rating: 5,
    },
  },
];

// Spending milestones
export const SPENDING_MILESTONES: SpendingMilestone[] = [
  {
    id: 'first_100',
    title: 'First Century',
    description: 'Spend your first $100',
    spendAmount: 100,
    reward: {
      type: 'points',
      value: 200,
    },
  },
  {
    id: 'skincare_enthusiast',
    title: 'Skincare Enthusiast',
    description: 'Reach $250 in total purchases',
    spendAmount: 250,
    reward: {
      type: 'tier_boost',
      value: { points: 250, tier: 'beauty_enthusiast' },
    },
  },
  {
    id: 'beauty_investor',
    title: 'Beauty Investor',
    description: 'Invest $500 in your skincare journey',
    spendAmount: 500,
    reward: {
      type: 'discount',
      value: { percentage: 15, validFor: 30 },
    },
  },
  {
    id: 'skincare_goddess',
    title: 'Skincare Goddess',
    description: 'Reach $1000 in lifetime purchases',
    spendAmount: 1000,
    reward: {
      type: 'tier_boost',
      value: { tier: 'vip_goddess', exclusive: ['personal-consultation'] },
    },
  },
];

// Helper functions
export function getActiveSpendingChallenges(): SpendingChallenge[] {
  const now = new Date();
  return SPENDING_CHALLENGES.filter(challenge => {
    if (!challenge.isActive) return false;
    
    if (challenge.startDate) {
      const startDate = new Date(challenge.startDate);
      if (now < startDate) return false;
    }
    
    if (challenge.endDate) {
      const endDate = new Date(challenge.endDate);
      if (now > endDate) return false;
    }
    
    if (challenge.maxParticipants && challenge.currentParticipants) {
      if (challenge.currentParticipants >= challenge.maxParticipants) return false;
    }
    
    return true;
  });
}

export function getChallengeProgress(challenge: SpendingChallenge, userSpend: number, userProducts: string[] = []): number {
  let progress = 0;
  
  // Calculate spend progress
  const spendProgress = Math.min(userSpend / challenge.requirements.minSpend, 1);
  progress += spendProgress * 0.7; // 70% weight on spending
  
  // Calculate category/product progress
  if (challenge.requirements.categories) {
    // This would need actual user purchase data to calculate properly
    progress += 0.3; // Placeholder
  }
  
  if (challenge.requirements.specificProducts) {
    const requiredProducts = challenge.requirements.specificProducts;
    const matchedProducts = userProducts.filter(p => requiredProducts.includes(p));
    const productProgress = matchedProducts.length / requiredProducts.length;
    progress = spendProgress * 0.5 + productProgress * 0.5;
  }
  
  return Math.min(progress, 1);
}

export function getRecommendedChallengeForUser(userSpendingHistory: number, userTier: string): SpendingChallenge | null {
  const activeChallenges = getActiveSpendingChallenges();
  
  // Recommend based on user spending level
  if (userSpendingHistory < 100) {
    return activeChallenges.find(c => c.category === 'starter') || null;
  } else if (userSpendingHistory < 300) {
    return activeChallenges.find(c => c.difficulty === 'medium') || null;
  } else {
    return activeChallenges.find(c => c.category === 'luxury') || null;
  }
}

export function calculateTimeRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getBundleForChallenge(challengeId: string): SpendingBundle | null {
  return SPENDING_BUNDLES.find(bundle => bundle.challenge?.challengeId === challengeId) || null;
}

// FOMO and urgency helpers
export function getUrgencyLevel(challenge: SpendingChallenge): 'low' | 'medium' | 'high' | 'critical' {
  if (challenge.endDate) {
    const daysRemaining = calculateTimeRemaining(challenge.endDate);
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
  }
  
  if (challenge.maxParticipants && challenge.currentParticipants) {
    const slotsRemaining = challenge.maxParticipants - challenge.currentParticipants;
    const percentageFull = (challenge.currentParticipants / challenge.maxParticipants) * 100;
    
    if (percentageFull >= 90) return 'critical';
    if (percentageFull >= 75) return 'high';
    if (percentageFull >= 50) return 'medium';
  }
  
  return 'low';
}

export function getUrgencyMessage(challenge: SpendingChallenge): string {
  const urgency = getUrgencyLevel(challenge);
  
  switch (urgency) {
    case 'critical':
      if (challenge.endDate) {
        const hours = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));
        return `⚡ Only ${hours} hours left!`;
      }
      if (challenge.maxParticipants && challenge.currentParticipants) {
        const remaining = challenge.maxParticipants - challenge.currentParticipants;
        return `🔥 Only ${remaining} spots remaining!`;
      }
      return '🚨 Ending very soon!';
      
    case 'high':
      if (challenge.endDate) {
        const days = calculateTimeRemaining(challenge.endDate);
        return `⏰ ${days} days left`;
      }
      return '🔥 Almost full!';
      
    case 'medium':
      if (challenge.currentParticipants) {
        return `👥 ${challenge.currentParticipants} people joined`;
      }
      return '📈 Popular choice';
      
    default:
      return challenge.urgencyText || '';
  }
}

// Smart Bundle Recommendation System
export function getPersonalizedBundles(userTier: string, userSpendingHistory: number, userPurchaseHistory: string[] = []) {
  const allBundles = SPENDING_BUNDLES.map(bundle => ({
    ...bundle,
    score: calculateBundleScore(bundle, userTier, userSpendingHistory, userPurchaseHistory)
  }));
  
  return allBundles.sort((a, b) => b.score - a.score);
}

function calculateBundleScore(bundle: any, userTier: string, userSpendingHistory: number, userPurchaseHistory: string[]): number {
  let score = 0;
  
  // Price appropriateness (30% weight)
  const priceRatio = bundle.bundlePrice / Math.max(userSpendingHistory, 50);
  if (priceRatio <= 0.8) score += 30;      // Well within budget
  else if (priceRatio <= 1.2) score += 25; // Slightly above typical spend
  else if (priceRatio <= 1.5) score += 15; // Stretch purchase
  else score += 5;                          // Expensive for user
  
  // Difficulty matching user tier (25% weight)
  const tierMap: Record<string, string[]> = {
    'glow_starter': ['beginner', 'easy'],
    'beauty_enthusiast': ['beginner', 'intermediate'],
    'skincare_guru': ['intermediate', 'advanced'],
    'vip_goddess': ['advanced', 'expert', 'luxury']
  };
  
  const userDifficulties = tierMap[userTier] || ['beginner'];
  if (userDifficulties.includes(bundle.difficulty)) score += 25;
  else score += 10;
  
  // Completion rate and popularity (20% weight)
  score += (bundle.completionRate / 100) * 15;
  if (bundle.isPopular) score += 5;
  
  // Value proposition (15% weight)
  const savingsPercentage = (bundle.savings / bundle.originalPrice) * 100;
  if (savingsPercentage >= 25) score += 15;
  else if (savingsPercentage >= 15) score += 12;
  else if (savingsPercentage >= 10) score += 8;
  else score += 3;
  
  // Urgency and scarcity (10% weight)
  if (bundle.isLimitedTime) score += 5;
  if (bundle.spotsLeft && bundle.spotsLeft < 20) score += 5;
  
  // Category diversity bonus - encourage trying new categories
  const userCategories = getUserCategoryPreference(userPurchaseHistory);
  if (!userCategories.includes(bundle.category)) score += 5;
  
  return Math.round(score);
}

function getUserCategoryPreference(purchaseHistory: string[]): string[] {
  // In a real app, this would analyze actual purchase history
  // For demo, return some defaults based on mock data
  return ['routine-building', 'hydration'];
}

export function getBundleRecommendationReason(bundle: any, userTier: string, userSpendingHistory: number): string {
  const reasons = [];
  
  // Price-based reasons
  const priceRatio = bundle.bundlePrice / Math.max(userSpendingHistory, 50);
  if (priceRatio <= 0.8) {
    reasons.push('Great value for your budget');
  } else if (priceRatio > 1.5) {
    reasons.push('Investment piece for serious results');
  }
  
  // Tier-based reasons
  if (userTier === 'glow_starter' && bundle.difficulty === 'beginner') {
    reasons.push('Perfect for skincare beginners');
  } else if (userTier === 'vip_goddess' && bundle.category === 'luxury') {
    reasons.push('Exclusive VIP collection');
  }
  
  // Category-based reasons
  if (bundle.category === 'routine-building') {
    reasons.push('Complete routine solution');
  } else if (bundle.category === 'anti-aging') {
    reasons.push('Advanced anti-aging technology');
  }
  
  // Urgency reasons
  if (bundle.isLimitedTime) {
    reasons.push('Limited time offer');
  }
  if (bundle.spotsLeft && bundle.spotsLeft < 20) {
    reasons.push('Almost sold out');
  }
  
  // Popularity reasons
  if (bundle.isPopular) {
    reasons.push('Customer favorite');
  }
  if (bundle.completionRate > 85) {
    reasons.push('High success rate');
  }
  
  return reasons.slice(0, 2).join(' • ') || 'Recommended for you';
}

export function getBundlesForChallenge(challengeId: string) {
  return SPENDING_BUNDLES.filter(bundle => bundle.challengeId === challengeId);
}

export function getComplementaryBundles(selectedBundleId: string, userTier: string) {
  const selectedBundle = SPENDING_BUNDLES.find(b => b.id === selectedBundleId);
  if (!selectedBundle) return [];
  
  // Find bundles in different categories but similar difficulty/price range
  return SPENDING_BUNDLES
    .filter(bundle => 
      bundle.id !== selectedBundleId &&
      bundle.category !== selectedBundle.category &&
      Math.abs(bundle.bundlePrice - selectedBundle.bundlePrice) < 100
    )
    .slice(0, 3);
}

export function getUpsellBundles(currentBundlePrice: number, userTier: string) {
  const upsellRange = currentBundlePrice * 1.5;
  
  return SPENDING_BUNDLES
    .filter(bundle => 
      bundle.bundlePrice > currentBundlePrice &&
      bundle.bundlePrice <= upsellRange
    )
    .sort((a, b) => a.bundlePrice - b.bundlePrice)
    .slice(0, 2);
}

// Cross-sell opportunities based on purchase patterns
export function getCrossSellOpportunities(userPurchaseHistory: string[], userTier: string) {
  const crossSells = [];
  
  // If user bought cleanser, suggest serum/moisturizer bundles
  if (userPurchaseHistory.includes('cleanser')) {
    crossSells.push(...SPENDING_BUNDLES.filter(b => 
      b.category === 'routine-building' || b.category === 'hydration'
    ));
  }
  
  // If user is high tier, suggest luxury items
  if (['skincare_guru', 'vip_goddess'].includes(userTier)) {
    crossSells.push(...SPENDING_BUNDLES.filter(b => b.category === 'luxury'));
  }
  
  return crossSells.slice(0, 3);
}