"use client";

import { useState } from 'react';
import { CheckCircle, Clock, Star, Zap, Trophy, Gift } from 'lucide-react';
import { Challenge } from '@/app/types/gamification';
import { cn } from '@/app/lib/utils';

interface ChallengeCardProps {
  challenge: Challenge & {
    isCompleted?: boolean;
    progress?: {
      current: number;
      target: number;
    };
    event?: {
      id: string;
      name: string;
      theme: string;
    };
  };
  onComplete?: (challengeId: string, challengeType: string) => void;
  className?: string;
}

export function ChallengeCard({ challenge, onComplete, className }: ChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const progressPercentage = challenge.progress ? 
    Math.min((challenge.progress.current / challenge.progress.target) * 100, 100) : 0;

  const handleComplete = async () => {
    if (challenge.isCompleted || isCompleting || !onComplete) return;
    
    setIsCompleting(true);
    try {
      await onComplete(challenge.id, challenge.type);
    } finally {
      setIsCompleting(false);
    }
  };

  const getChallengeTypeIcon = () => {
    switch (challenge.type) {
      case 'daily': return <Clock className="h-4 w-4" />;
      case 'weekly': return <Star className="h-4 w-4" />;
      case 'seasonal': return <Gift className="h-4 w-4" />;
      case 'special': return <Trophy className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getChallengeTypeColor = () => {
    switch (challenge.type) {
      case 'daily': return 'text-blue-600 bg-blue-100';
      case 'weekly': return 'text-purple-600 bg-purple-100';
      case 'seasonal': return 'text-orange-600 bg-orange-100';
      case 'special': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = () => {
    switch (challenge.category) {
      case 'skincare': return 'text-pink-600';
      case 'shopping': return 'text-green-600';
      case 'social': return 'text-blue-600';
      case 'education': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200",
      "hover:shadow-lg hover:border-pink-200",
      challenge.isCompleted && "bg-green-50 border-green-200",
      challenge.type === 'seasonal' && "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                getChallengeTypeColor()
              )}>
                {getChallengeTypeIcon()}
                {challenge.type}
              </div>
            </div>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end gap-2">
          {challenge.isCompleted ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg
                       hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Completing...
                </div>
              ) : (
                'Complete'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {challenge.progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{challenge.progress.current}/{challenge.progress.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                challenge.isCompleted ? "bg-green-500" : "bg-pink-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Points */}
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900">
              {challenge.points} pts
              {challenge.multiplier && challenge.multiplier > 1 && (
                <span className="text-orange-600 ml-1">
                  (×{challenge.multiplier})
                </span>
              )}
            </span>
          </div>

          {/* Category */}
          <div className={cn(
            "text-xs font-medium capitalize",
            getCategoryColor()
          )}>
            {challenge.category}
          </div>
        </div>

        {/* Seasonal Event Badge */}
        {challenge.event && (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            <Gift className="h-3 w-3" />
            {challenge.event.name}
          </div>
        )}
      </div>

      {/* Special seasonal styling */}
      {challenge.type === 'seasonal' && (
        <div className="absolute top-2 right-2 opacity-20">
          <div className="text-6xl transform rotate-12">🎉</div>
        </div>
      )}
    </div>
  );
}