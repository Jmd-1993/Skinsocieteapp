"use client";

import { useState } from 'react';
import { ShoppingBag, Gift, Star, Clock, Users, Zap, ArrowRight, Heart } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  description?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionRate: number;
  isPopular?: boolean;
  isLimitedTime?: boolean;
  timeLeft?: number; // hours
  spotsLeft?: number;
  challengeId?: string; // Associated spending challenge
  benefits: string[];
  testimonial?: {
    name: string;
    text: string;
    rating: number;
  };
}

interface BundleRecommendationProps {
  bundles: Bundle[];
  userTier: string;
  userSpendingHistory: number;
  onPurchaseBundle: (bundleId: string) => void;
  onViewBundle: (bundleId: string) => void;
  onAddToWishlist?: (bundleId: string) => void;
  className?: string;
}

export function BundleRecommendation({
  bundles,
  userTier,
  userSpendingHistory,
  onPurchaseBundle,
  onViewBundle,
  onAddToWishlist,
  className
}: BundleRecommendationProps) {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationScore = (bundle: Bundle) => {
    let score = 0;
    
    // Price appropriateness (30%)
    if (bundle.bundlePrice <= userSpendingHistory * 0.8) score += 30;
    else if (bundle.bundlePrice <= userSpendingHistory * 1.2) score += 20;
    else if (bundle.bundlePrice <= userSpendingHistory * 1.5) score += 10;
    
    // Difficulty matching (25%)
    if (userTier === 'glow_starter' && bundle.difficulty === 'beginner') score += 25;
    else if (userTier === 'beauty_enthusiast' && bundle.difficulty === 'intermediate') score += 25;
    else if (['skincare_guru', 'vip_goddess'].includes(userTier) && bundle.difficulty === 'advanced') score += 25;
    else score += 10;
    
    // Popularity and completion rate (25%)
    score += bundle.completionRate * 0.25;
    
    // Value proposition (20%)
    const savingsPercentage = (bundle.savings / bundle.originalPrice) * 100;
    if (savingsPercentage >= 25) score += 20;
    else if (savingsPercentage >= 15) score += 15;
    else if (savingsPercentage >= 10) score += 10;
    
    return Math.round(score);
  };

  const sortedBundles = bundles
    .map(bundle => ({ ...bundle, score: getRecommendationScore(bundle) }))
    .sort((a, b) => b.score - a.score);

  const formatTimeLeft = (hours: number) => {
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended Bundles</h2>
          <p className="text-gray-600">Curated collections to complete your skincare goals</p>
        </div>
        <div className="text-sm text-gray-500">
          Personalized for {userTier.replace('_', ' ')} tier
        </div>
      </div>

      <div className="grid gap-6">
        {sortedBundles.slice(0, 3).map((bundle, index) => (
          <div
            key={bundle.id}
            className={cn(
              "bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden",
              "hover:shadow-xl hover:border-pink-200",
              bundle.isLimitedTime && "border-red-200 bg-gradient-to-br from-red-50 to-pink-50",
              bundle.isPopular && !bundle.isLimitedTime && "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50",
              selectedBundle === bundle.id && "ring-2 ring-pink-500 ring-offset-2",
              index === 0 && "border-pink-300" // Highlight top recommendation
            )}
            onClick={() => setSelectedBundle(selectedBundle === bundle.id ? null : bundle.id)}
          >
            {/* Header with badges */}
            <div className="relative p-6 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {bundle.category === 'anti-aging' ? '✨' : 
                     bundle.category === 'hydration' ? '💧' : 
                     bundle.category === 'acne' ? '🌿' : '🌸'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                    <p className="text-gray-600">{bundle.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {index === 0 && (
                    <div className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ⭐ Top Pick
                    </div>
                  )}
                  {bundle.isPopular && (
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🔥 Popular
                    </div>
                  )}
                  {bundle.isLimitedTime && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                      ⏰ Limited
                    </div>
                  )}
                </div>
              </div>

              {/* Urgency indicators */}
              <div className="flex items-center gap-4 mb-4">
                {bundle.timeLeft && (
                  <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    {formatTimeLeft(bundle.timeLeft)}
                  </div>
                )}
                {bundle.spotsLeft && (
                  <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Only {bundle.spotsLeft} left
                  </div>
                )}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getDifficultyColor(bundle.difficulty)
                )}>
                  {bundle.difficulty}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  {bundle.completionRate}% completion rate
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {bundle.products.slice(0, 4).map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center text-lg">
                      {product.category === 'cleanser' ? '🧴' :
                       product.category === 'serum' ? '💧' :
                       product.category === 'moisturizer' ? '🧴' : '✨'}
                    </div>
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price}</p>
                  </div>
                ))}
                {bundle.products.length > 4 && (
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center">
                    <span className="text-sm text-gray-600">+{bundle.products.length - 4} more</span>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="px-6 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">What you'll achieve:</h4>
              <div className="grid grid-cols-2 gap-2">
                {bundle.benefits.slice(0, 4).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Zap className="h-3 w-3 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            {bundle.testimonial && (
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(bundle.testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{bundle.testimonial.name}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{bundle.testimonial.text}"</p>
                </div>
              </div>
            )}

            {/* Pricing and actions */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">${bundle.bundlePrice}</span>
                    <span className="text-lg text-gray-500 line-through">${bundle.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">Save ${bundle.savings}</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((bundle.savings / bundle.originalPrice) * 100)}% off)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onAddToWishlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWishlist(bundle.id);
                      }}
                      className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBundle(bundle.id);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPurchaseBundle(bundle.id);
                    }}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add Bundle
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Challenge connection */}
            {bundle.challengeId && (
              <div className="bg-pink-50 px-6 py-3 border-t border-pink-100">
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-pink-600" />
                  <span className="text-pink-700">
                    <strong>Challenge Bonus:</strong> Purchase this bundle to complete your active spending challenge!
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedBundles.length > 3 && (
        <div className="text-center">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            View All {sortedBundles.length} Bundles
          </button>
        </div>
      )}
    </div>
  );
}