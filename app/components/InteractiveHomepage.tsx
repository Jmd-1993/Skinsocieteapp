'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "./layout/MainLayout";
import { 
  Sparkles, 
  Star, 
  Calendar, 
  ShoppingBag, 
  TrendingUp,
  Award,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { SocialFeed } from "./social/SocialFeed";
import { useAuth } from "../lib/auth-context";

interface UserProgress {
  points: number;
  streak: number;
  achievements: string[];
  stats: {
    totalOrders: number;
    totalVisits: number;
    totalSpent: number;
    daysActive: number;
  };
  todayProgress: {
    completed: number;
    total: number;
    percentage: number;
    tasks: {
      morningCleanse: boolean;
      vitaminC: boolean;
      eveningRoutine: boolean;
    };
  };
}

export function InteractiveHomepage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userId = user?.id || 'demo-user';
        const response = await fetch(`/api/user/progress?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
          setProgress(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        // Set default values for demo
        setProgress({
          points: 0,
          streak: 0,
          achievements: [],
          stats: { totalOrders: 0, totalVisits: 0, totalSpent: 0, daysActive: 0 },
          todayProgress: {
            completed: 0,
            total: 3,
            percentage: 0,
            tasks: { morningCleanse: false, vitaminC: false, eveningRoutine: false }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  // Handle task completion
  const completeTask = async (task: 'morningCleanse' | 'vitaminC' | 'eveningRoutine') => {
    if (!progress || progress.todayProgress.tasks[task]) return;

    try {
      const userId = user?.id || 'demo-user';
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'complete_task',
          data: { task }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh progress
        const refreshResponse = await fetch(`/api/user/progress?userId=${userId}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setProgress(refreshResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Reset progress (for testing)
  const resetProgress = async () => {
    try {
      const userId = user?.id || 'demo-user';
      const response = await fetch(`/api/user/progress?userId=${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        setProgress(result.data);
      }
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  };

  const getTaskName = (task: string) => {
    switch (task) {
      case 'morningCleanse': return 'Morning cleanse';
      case 'vitaminC': return 'Vitamin C serum';
      case 'eveningRoutine': return 'Evening routine';
      default: return task;
    }
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return 'VIP Goddess';
    if (points >= 1000) return 'Skincare Guru';
    if (points >= 500) return 'Beauty Enthusiast';
    return 'Glow Starter';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-8 animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-32"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-xl h-20"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Beauty'}!
              </h1>
              <p className="text-pink-100 mb-4">
                You&apos;re on track for amazing skin transformation
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">{progress?.points.toLocaleString() || '0'} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{getLoyaltyTier(progress?.points || 0)}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-yellow-300 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-xl font-bold text-gray-900">{progress?.streak || 0} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-bold text-gray-900">{progress?.todayProgress.percentage || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-xl font-bold text-gray-900">{progress?.stats.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visits</p>
                <p className="text-xl font-bold text-gray-900">{progress?.stats.totalVisits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interactive Daily Routine */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Daily Routine</h3>
              <button
                onClick={resetProgress}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Reset (Demo)
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(progress?.todayProgress.tasks || {}).map(([task, completed]) => (
                <div key={task} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">{getTaskName(task)}</span>
                  </div>
                  {completed ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Done
                    </span>
                  ) : (
                    <button
                      onClick={() => completeTask(task as any)}
                      className="text-xs text-pink-600 font-medium hover:text-pink-700 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress?.todayProgress.percentage || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {progress?.todayProgress.percentage || 0}% complete today
            </p>
            {progress?.todayProgress.completed === 3 && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  🎉 All tasks complete! +{progress.streak > 0 ? '75' : '25'} points earned
                </p>
              </div>
            )}
          </div>

          {/* Quick Booking */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Quick Booking</h3>
            <div className="space-y-3">
              <Link
                href="/appointments"
                className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Dermal Filler - Lips</p>
                  <p className="text-sm text-gray-600">30 min • $500</p>
                </div>
                <Plus className="h-5 w-5 text-pink-600" />
              </Link>
              <Link
                href="/appointments"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Bio Remodelling</p>
                  <p className="text-sm text-gray-600">60 min • $800</p>
                </div>
                <Plus className="h-5 w-5 text-blue-600" />
              </Link>
            </div>
            <Link
              href="/appointments"
              className="block w-full mt-4 text-center py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>

        {/* Community Feed */}
        <SocialFeed />

        {/* Active Challenges */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <p className="font-medium">7-Day Glow Challenge</p>
                <p className="text-sm text-gray-600">Complete daily routine for a week</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">{Math.min(progress?.streak || 0, 7)}/7</p>
                <p className="text-xs text-gray-600">+200 points</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div>
                <p className="font-medium">Shopping Spree</p>
                <p className="text-sm text-gray-600">Spend $100 this month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">${progress?.stats.totalSpent || 0}</p>
                <p className="text-xs text-gray-600">+150 points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.map((achievement) => (
                <span
                  key={achievement}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"
                >
                  🏆 {achievement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}