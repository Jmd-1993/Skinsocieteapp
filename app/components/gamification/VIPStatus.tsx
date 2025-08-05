"use client";

import { Crown, Zap, Gift, Truck, Star, ArrowUp } from 'lucide-react';
import { VIPTier } from '@/app/types/gamification';
import { getVIPTierByPoints, getNextVIPTier } from '@/app/lib/challenges';
import { cn } from '@/app/lib/utils';

interface VIPStatusProps {
  userPoints: number;
  className?: string;
}

export function VIPStatus({ userPoints, className }: VIPStatusProps) {
  const currentTier = getVIPTierByPoints(userPoints);
  const nextTier = getNextVIPTier(userPoints);
  
  const progressToNext = nextTier ? 
    ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  const getTierGradient = (tier: VIPTier) => {
    switch (tier.id) {
      case 'glow_starter': return 'from-gray-400 to-gray-600';
      case 'beauty_enthusiast': return 'from-green-400 to-green-600';
      case 'skincare_guru': return 'from-purple-400 to-purple-600';
      case 'vip_goddess': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl",
            getTierGradient(currentTier)
          )}>
            {currentTier.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{currentTier.name}</h3>
            <p className="text-sm text-gray-600">Level {currentTier.level}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-600">
            <Zap className="h-4 w-4" />
            <span className="font-semibold">{userPoints.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500">total points</p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress to {nextTier.name}</span>
            <div className="flex items-center gap-1 text-sm text-gray-900">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span>{nextTier.minPoints - userPoints} points to go</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={cn(
                "h-3 rounded-full bg-gradient-to-r transition-all duration-700",
                getTierGradient(nextTier)
              )}
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Benefits */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          Your VIP Benefits
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Discount */}
          {currentTier.discountPercentage > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">{currentTier.discountPercentage}%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Member Discount</p>
                <p className="text-xs text-green-600">On all purchases</p>
              </div>
            </div>
          )}

          {/* Free Shipping */}
          {currentTier.freeShipping && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Free Shipping</p>
                <p className="text-xs text-blue-600">On all orders</p>
              </div>
            </div>
          )}

          {/* Exclusive Access */}
          {currentTier.exclusiveAccess && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Exclusive Access</p>
                <p className="text-xs text-purple-600">Early access to new products</p>
              </div>
            </div>
          )}

          {/* Birthday Bonus */}
          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <Gift className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-pink-900">Birthday Bonus</p>
              <p className="text-xs text-pink-600">{currentTier.birthdayBonus} points on your birthday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Tier Preview */}
      {nextTier && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Unlock Next Level</h4>
          <div className={cn(
            "p-4 rounded-lg bg-gradient-to-r text-white relative overflow-hidden",
            getTierGradient(nextTier)
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{nextTier.icon}</div>
                <div>
                  <h5 className="font-semibold">{nextTier.name}</h5>
                  <p className="text-sm opacity-90">Level {nextTier.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Unlock at</p>
                <p className="font-bold">{nextTier.minPoints.toLocaleString()} pts</p>
              </div>
            </div>
            
            {/* Next tier benefits preview */}
            <div className="mt-3 text-sm opacity-90">
              <p>New benefits: {nextTier.discountPercentage}% discount, {nextTier.birthdayBonus} birthday points</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 text-6xl opacity-20">
              <Crown />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}