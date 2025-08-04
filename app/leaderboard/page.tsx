'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "../components/layout/MainLayout";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Crown, 
  Star,
  MapPin,
  Calendar,
  RefreshCw,
  Users,
  Target,
  Zap
} from "lucide-react";
import { useAuth } from "../lib/auth-context";

interface LeaderboardUser {
  userId: string;
  displayName: string;
  avatar: string;
  clinic: string;
  points: number;
  streak: number;
  achievements: number;
  tier: string;
  rank: number;
  isCurrentUser: boolean;
  lastActive: string;
  stats: {
    totalOrders: number;
    totalVisits: number;
    totalSpent: number;
    daysActive: number;
  };
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  currentUser: LeaderboardUser;
  stats: {
    totalUsers: number;
    averagePoints: number;
    topScore: number;
    yourRank: number;
    period: string;
  };
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const userId = user?.id || 'demo-user';
      const response = await fetch(`/api/leaderboard?userId=${userId}&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP Goddess': return 'text-purple-600 bg-purple-100';
      case 'Skincare Guru': return 'text-blue-600 bg-blue-100';
      case 'Beauty Enthusiast': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="bg-gray-200 rounded-2xl h-32"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 rounded-xl h-16"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beauty Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other Skin Societé members</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Update'}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Competition Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data?.stats.totalUsers || 0}</div>
              <div className="text-pink-100 text-sm">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{data?.stats.yourRank || 0}</div>
              <div className="text-pink-100 text-sm">Your Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data?.stats.topScore.toLocaleString() || 0}</div>
              <div className="text-pink-100 text-sm">Top Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data?.stats.averagePoints.toLocaleString() || 0}</div>
              <div className="text-pink-100 text-sm">Average Points</div>
            </div>
          </div>
        </div>

        {/* Your Position */}
        {data?.currentUser && (
          <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Position</h3>
              <span className="text-sm text-pink-600 font-medium">Updated live</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full">
                {data.currentUser.rank <= 3 ? (
                  getRankIcon(data.currentUser.rank)
                ) : (
                  <span className="text-2xl">{data.currentUser.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-gray-900">{data.currentUser.displayName}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(data.currentUser.tier)}`}>
                    {data.currentUser.tier}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{data.currentUser.points.toLocaleString()} points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span>{data.currentUser.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <span>{data.currentUser.achievements} achievements</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{data.currentUser.clinic}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getRankBadge(data.currentUser.rank)}`}>
                  #{data.currentUser.rank}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {data?.leaderboard && data.leaderboard.length >= 3 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-6 text-center">🏆 Top 3 Beauty Champions</h3>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-2xl">{data.leaderboard[1]?.avatar}</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 h-24 flex flex-col justify-center">
                  <Medal className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="font-bold text-sm">{data.leaderboard[1]?.displayName}</div>
                  <div className="text-xs text-gray-600">{data.leaderboard[1]?.points.toLocaleString()}</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-3 mx-auto relative">
                  <span className="text-3xl">{data.leaderboard[0]?.avatar}</span>
                  <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300" />
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 h-32 flex flex-col justify-center">
                  <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="font-bold">{data.leaderboard[0]?.displayName}</div>
                  <div className="text-sm text-yellow-700">{data.leaderboard[0]?.points.toLocaleString()}</div>
                  <div className="text-xs text-yellow-600">{data.leaderboard[0]?.tier}</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-2xl">{data.leaderboard[2]?.avatar}</span>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 h-24 flex flex-col justify-center">
                  <Award className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <div className="font-bold text-sm">{data.leaderboard[2]?.displayName}</div>
                  <div className="text-xs text-gray-600">{data.leaderboard[2]?.points.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Complete Rankings</h3>
            <p className="text-sm text-gray-600">Live updates every 30 seconds</p>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.leaderboard.map((member, index) => (
              <div
                key={member.userId}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  member.isCurrentUser ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(member.rank)}
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    member.rank <= 3 ? getRankBadge(member.rank) : 'bg-gray-100'
                  }`}>
                    {member.avatar}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">
                        {member.displayName}
                        {member.isCurrentUser && <span className="text-pink-600 ml-2">(You)</span>}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                        {member.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{member.clinic}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Active {member.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{member.points.toLocaleString()}</div>
                      <div className="text-gray-500">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{member.streak}</div>
                      <div className="text-gray-500">Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{member.achievements}</div>
                      <div className="text-gray-500">Awards</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competition Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How Rankings Work</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete daily skincare tasks to earn points</li>
                <li>• Maintain streaks for bonus points</li>
                <li>• Purchase products and book treatments for extra points</li>
                <li>• Unlock achievements to boost your score</li>
                <li>• Rankings update in real-time throughout the day</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}