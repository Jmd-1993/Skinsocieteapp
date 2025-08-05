"use client";

import { useState, useEffect } from 'react';
import { MainLayout } from '@/app/components/layout/MainLayout';
import { SpendingChallengeCard } from '@/app/components/gamification/SpendingChallengeCard';
import { VIPStatus } from '@/app/components/gamification/VIPStatus';
import { BundleRecommendation } from '@/app/components/gamification/BundleRecommendation';
import { useAuth } from '@/app/lib/auth-context';
import { SpendingChallenge } from '@/app/types/spending-challenges';
import { Target, TrendingUp, Gift, Clock, Users, Zap, Crown, RefreshCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';

type ChallengeFilter = 'all' | 'routine_builder' | 'seasonal' | 'milestone' | 'time_limited';

interface ChallengeWithProgress extends SpendingChallenge {
  progress?: number;
  timeRemaining?: number | null;
  spotsRemaining?: number | null;
}

export default function SpendingChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [recommendedChallenge, setRecommendedChallenge] = useState<ChallengeWithProgress | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [filter, setFilter] = useState<ChallengeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [participatingChallenges, setParticipatingChallenges] = useState<string[]>([]);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const [challengesResponse, recommendedResponse, bundlesResponse, progressResponse] = await Promise.all([
        fetch(`/api/spending-challenges?userId=${user?.id || 'demo-user'}&type=active`),
        fetch(`/api/spending-challenges?userId=${user?.id || 'demo-user'}&type=recommended`),
        fetch(`/api/spending-challenges?userId=${user?.id || 'demo-user'}&type=bundles`),
        fetch(`/api/user/progress?userId=${user?.id || 'demo-user'}`)
      ]);

      if (challengesResponse.ok) {
        const data = await challengesResponse.json();
        setChallenges(data.data.challenges);
      }

      if (recommendedResponse.ok) {
        const data = await recommendedResponse.json();
        setRecommendedChallenge(data.data.recommendedChallenge);
      }

      if (bundlesResponse.ok) {
        const data = await bundlesResponse.json();
        setBundles(data.data.bundles);
      }

      if (progressResponse.ok) {
        const data = await progressResponse.json();
        setUserProgress(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch spending challenges:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/spending-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          challengeId,
          action: 'join_challenge',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setParticipatingChallenges(prev => [...prev, challengeId]);
        alert(result.message || 'Successfully joined challenge! 🎉');
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
      alert('Failed to join challenge. Please try again.');
    }
  };

  const handleViewDetails = (challengeId: string) => {
    // Navigate to challenge details or show modal
    console.log('View details for challenge:', challengeId);
  };

  const handlePurchaseBundle = async (bundleId: string) => {
    try {
      // In a real app, this would add the bundle to cart and redirect to checkout
      console.log('Purchase bundle:', bundleId);
      alert('Bundle added to cart! Redirecting to checkout...');
    } catch (error) {
      console.error('Failed to purchase bundle:', error);
      alert('Failed to purchase bundle. Please try again.');
    }
  };

  const handleViewBundle = (bundleId: string) => {
    console.log('View bundle details:', bundleId);
    // Navigate to bundle details page
  };

  const handleAddToWishlist = (bundleId: string) => {
    console.log('Add to wishlist:', bundleId);
    alert('Added to wishlist! 💖');
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.type === filter;
  });

  const stats = {
    totalChallenges: challenges.length,
    activeParticipations: participatingChallenges.length,
    potentialRewards: challenges.reduce((sum, c) => sum + c.rewards.points, 0),
    urgentChallenges: challenges.filter(c => c.timeRemaining && c.timeRemaining <= 3).length,
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading spending challenges...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Spending Challenges</h1>
            <p className="text-gray-600 mt-2">Complete challenges to earn rewards and unlock exclusive benefits</p>
          </div>
          
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Recommended Challenge Banner */}
        {recommendedChallenge && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="h-6 w-6" />
                <h2 className="text-xl font-bold">Recommended For You</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{recommendedChallenge.title}</h3>
                  <p className="text-pink-100 mb-4">{recommendedChallenge.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      ${recommendedChallenge.requirements.minSpend} target
                    </span>
                    <span>{recommendedChallenge.rewards.points} points</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleJoinChallenge(recommendedChallenge.id)}
                    className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
                  >
                    Join Challenge
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 text-8xl opacity-20">💎</div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* VIP Status */}
            <VIPStatus userPoints={userProgress?.points || 0} />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Challenge Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-semibold text-blue-600">{stats.totalChallenges}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Participating</span>
                  <span className="font-semibold text-green-600">{stats.activeParticipations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Potential Points</span>
                  <span className="font-semibold text-yellow-600">{stats.potentialRewards.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgent</span>
                  <span className="font-semibold text-red-600">{stats.urgentChallenges}</span>
                </div>
              </div>
            </div>

            {/* Spending Milestone */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Next Milestone</h3>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm text-gray-600 mb-2">Spend $250 to unlock</p>
                <p className="font-semibold text-purple-600">Beauty Enthusiast Tier</p>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((userProgress?.stats?.totalSpent || 0) / 250) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${userProgress?.stats?.totalSpent || 0} / $250
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filter Challenges</h3>
              <div className="space-y-2">
                {([
                  { id: 'all', name: 'All Challenges', icon: Target },
                  { id: 'routine_builder', name: 'Routine Builder', icon: Gift },
                  { id: 'seasonal', name: 'Seasonal', icon: TrendingUp },
                  { id: 'milestone', name: 'Milestones', icon: Crown },
                  { id: 'time_limited', name: 'Limited Time', icon: Clock }
                ] as const).map((filterType) => (
                  <button
                    key={filterType.id}
                    onClick={() => setFilter(filterType.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      filter === filterType.id
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <filterType.icon className="h-4 w-4" />
                    <span>{filterType.name}</span>
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
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges available</h3>
                  <p className="text-gray-600">Check back later for new spending challenges!</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <SpendingChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onViewDetails={handleViewDetails}
                    isParticipating={participatingChallenges.includes(challenge.id)}
                  />
                ))
              )}
            </div>

            {/* Smart Bundle Recommendations */}
            {bundles.length > 0 && (
              <div className="mt-8">
                <BundleRecommendation
                  bundles={bundles}
                  userTier={userProgress?.points ? 
                    (userProgress.points >= 2000 ? 'vip_goddess' : 
                     userProgress.points >= 1000 ? 'skincare_guru' : 
                     userProgress.points >= 500 ? 'beauty_enthusiast' : 'glow_starter') : 'glow_starter'}
                  userSpendingHistory={userProgress?.stats?.totalSpent || 0}
                  onPurchaseBundle={handlePurchaseBundle}
                  onViewBundle={handleViewBundle}
                  onAddToWishlist={handleAddToWishlist}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}