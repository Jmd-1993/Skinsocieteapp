"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/app/components/layout/MainLayout';
import { ChallengeCard } from '@/app/components/gamification/ChallengeCard';
import { VIPStatus } from '@/app/components/gamification/VIPStatus';
import { useAuth } from '@/app/lib/auth-context';
import { Challenge } from '@/app/types/gamification';
import { CalendarDays, Zap, Trophy, Gift, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';

type ChallengeFilter = 'all' | 'daily' | 'weekly' | 'seasonal';

interface ChallengeWithProgress extends Challenge {
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
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [filter, setFilter] = useState<ChallengeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChallenges = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const [challengesResponse, progressResponse] = await Promise.all([
        fetch(`/api/challenges?userId=${user?.id || 'demo-user'}&type=${filter}`),
        fetch(`/api/user/progress?userId=${user?.id || 'demo-user'}`)
      ]);

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData.data.challenges);
        setCurrentEvent(challengesData.data.currentEvent);
      }

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData.data);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filter, user?.id]);

  const handleChallengeComplete = async (challengeId: string, challengeType: string) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          challengeId,
          challengeType,
          progress: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data.challengeCompleted) {
          // Update local state
          setChallenges(prev => 
            prev.map(challenge => 
              challenge.id === challengeId 
                ? { ...challenge, isCompleted: true, progress: { ...challenge.progress!, current: challenge.progress!.target } }
                : challenge
            )
          );
          
          // Update user progress
          setUserProgress(result.data.progress);
          
          // Show success message
          alert(`Challenge completed! You earned ${result.data.pointsEarned} points! 🎉`);
        }
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      alert('Failed to complete challenge. Please try again.');
    }
  };

  const getFilterIcon = (filterType: ChallengeFilter) => {
    switch (filterType) {
      case 'daily': return <CalendarDays className="h-4 w-4" />;
      case 'weekly': return <Zap className="h-4 w-4" />;
      case 'seasonal': return <Gift className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.type === filter;
  });

  const completedCount = filteredChallenges.filter(c => c.isCompleted).length;
  const totalPoints = filteredChallenges.reduce((sum, c) => sum + (c.isCompleted ? c.points * (c.multiplier || 1) : 0), 0);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Challenges</h1>
            <p className="text-gray-600 mt-2">Complete challenges to earn points and unlock rewards</p>
          </div>
          
          <button
            onClick={() => fetchChallenges(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Current Event Banner */}
        {currentEvent && filter !== 'daily' && filter !== 'weekly' && (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="h-6 w-6" />
                <h2 className="text-xl font-bold">{currentEvent.name}</h2>
              </div>
              <p className="text-orange-100 mb-4">{currentEvent.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Special Event
                </span>
                <span>🎁 Exclusive Rewards Available</span>
                <span>🏆 Leaderboard Active</span>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 text-8xl opacity-20">🎉</div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* VIP Status */}
            <VIPStatus userPoints={userProgress?.points || 0} />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{completedCount}/{filteredChallenges.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points Earned</span>
                  <span className="font-semibold text-yellow-600">{totalPoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold text-orange-600">{userProgress?.streak || 0} days</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Challenges
              </h3>
              <div className="space-y-2">
                {(['all', 'daily', 'weekly', 'seasonal'] as ChallengeFilter[]).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      filter === filterType
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    {getFilterIcon(filterType)}
                    <span className="capitalize">{filterType} Challenges</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges available</h3>
                  <p className="text-gray-600">Check back later for new challenges!</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onComplete={handleChallengeComplete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}