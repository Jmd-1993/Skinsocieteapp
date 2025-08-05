"use client";

import { useState } from 'react';
import { Clock, Users, Zap, Gift, Target, ArrowRight, CheckCircle, Flame } from 'lucide-react';
import { SpendingChallenge } from '@/app/types/spending-challenges';
import { getUrgencyLevel, getUrgencyMessage } from '@/app/lib/spending-challenges';
import { cn } from '@/app/lib/utils';

interface SpendingChallengeCardProps {
  challenge: SpendingChallenge & {
    progress?: number;
    timeRemaining?: number | null;
    spotsRemaining?: number | null;
  };
  onJoin?: (challengeId: string) => void;
  onViewDetails?: (challengeId: string) => void;
  isParticipating?: boolean;
  className?: string;
}

export function SpendingChallengeCard({ 
  challenge, 
  onJoin, 
  onViewDetails, 
  isParticipating = false,
  className 
}: SpendingChallengeCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const urgencyLevel = getUrgencyLevel(challenge);
  const urgencyMessage = getUrgencyMessage(challenge);
  const progressPercentage = (challenge.progress || 0) * 100;

  const handleJoin = async () => {
    if (!onJoin || isParticipating) return;
    
    setIsJoining(true);
    try {
      await onJoin(challenge.id);
    } finally {
      setIsJoining(false);
    }
  };

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'routine_builder': return 'text-blue-600 bg-blue-100';
      case 'seasonal': return 'text-purple-600 bg-purple-100';
      case 'milestone': return 'text-yellow-600 bg-yellow-100';
      case 'bundle': return 'text-green-600 bg-green-100';
      case 'time_limited': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'critical': return 'text-red-600 bg-red-100 animate-pulse';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200",
      "hover:shadow-lg hover:border-pink-200",
      challenge.type === 'time_limited' && "bg-gradient-to-br from-red-50 to-pink-50 border-red-200",
      challenge.type === 'milestone' && "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
      isParticipating && "bg-green-50 border-green-200",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
              {isParticipating && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">{challenge.shortDescription}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getDifficultyColor()
          )}>
            <Target className="h-3 w-3" />
            {challenge.difficulty}
          </div>
          
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getTypeColor()
          )}>
            {challenge.type.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Progress Bar (if participating) */}
      {isParticipating && challenge.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>${(challenge.requirements.minSpend * (challenge.progress || 0)).toFixed(0)} / ${challenge.requirements.minSpend}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Requirements
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>💰 Spend ${challenge.requirements.minSpend.toLocaleString()}</div>
          {challenge.requirements.timeLimit && (
            <div>⏱️ Within {challenge.requirements.timeLimit} days</div>
          )}
          {challenge.requirements.categories && (
            <div>🛍️ From: {challenge.requirements.categories.join(', ')}</div>
          )}
          {challenge.requirements.minQuantity && (
            <div>📦 Minimum {challenge.requirements.minQuantity} products</div>
          )}
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Gift className="h-4 w-4 text-pink-600" />
          Rewards
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>{challenge.rewards.points.toLocaleString()} points</span>
          </div>
          {challenge.rewards.bonusPoints && (
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>+{challenge.rewards.bonusPoints} bonus</span>
            </div>
          )}
          {challenge.rewards.discount && (
            <div className="flex items-center gap-1">
              <span className="text-green-600">💸</span>
              <span>{challenge.rewards.discount.percentage}% off next order</span>
            </div>
          )}
          {challenge.rewards.freeProducts && (
            <div className="flex items-center gap-1">
              <span>🎁</span>
              <span>Free products</span>
            </div>
          )}
          {challenge.rewards.tierBoost && (
            <div className="flex items-center gap-1">
              <span>👑</span>
              <span>Tier boost</span>
            </div>
          )}
          {challenge.rewards.exclusiveAccess && (
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span>Exclusive access</span>
            </div>
          )}
        </div>
      </div>

      {/* Urgency & Social Proof */}
      <div className="flex items-center justify-between mb-4">
        {urgencyMessage && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getUrgencyColor()
          )}>
            {urgencyLevel === 'critical' && <Flame className="h-3 w-3" />}
            <Clock className="h-3 w-3" />
            {urgencyMessage}
          </div>
        )}
        
        {challenge.currentParticipants && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Users className="h-3 w-3" />
            <span>{challenge.currentParticipants} joined</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Est. completion: {challenge.estimatedCompletion}
        </div>
        
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(challenge.id)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              View Details
            </button>
          )}
          
          {!isParticipating ? (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg
                       hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Challenge
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Participating
            </div>
          )}
        </div>
      </div>

      {/* Special Effects */}
      {challenge.type === 'time_limited' && (
        <div className="absolute top-2 right-2 opacity-20">
          <Flame className="h-8 w-8 text-red-500" />
        </div>
      )}
      
      {challenge.popularityBoost && (
        <div className="absolute top-2 left-2">
          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            🔥 Popular
          </div>
        </div>
      )}
    </div>
  );
}