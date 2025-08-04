'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "../components/layout/MainLayout";
import { TrendingUp, Calendar, Star, Target, Award, CheckCircle, RefreshCw } from "lucide-react";
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

export default function ProgressPage() {
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

  const getTaskPoints = (task: string) => {
    switch (task) {
      case 'morningCleanse': return 25;
      case 'vitaminC': return 25;
      case 'eveningRoutine': return 25;
      default: return 25;
    }
  };

  const getAchievementIcon = (achievement: string) => {
    switch (achievement) {
      case 'first_100': return '💯';
      case 'week_warrior': return '🔥';
      case 'first_purchase': return '🛍️';
      case 'big_spender': return '💰';
      case 'profile_complete': return '👤';
      case 'first_visit': return '✨';
      default: return '🏆';
    }
  };

  const getAchievementTitle = (achievement: string) => {
    switch (achievement) {
      case 'first_100': return 'First 100 Points';
      case 'week_warrior': return 'Week Warrior';
      case 'first_purchase': return 'First Purchase';
      case 'big_spender': return 'Big Spender';
      case 'profile_complete': return 'Profile Complete';
      case 'first_visit': return 'First Visit';
      default: return achievement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getAchievementDescription = (achievement: string) => {
    switch (achievement) {
      case 'first_100': return 'Earned your first 100 points';
      case 'week_warrior': return '7-day routine streak';
      case 'first_purchase': return 'Made your first purchase';
      case 'big_spender': return 'Spent $500+ total';
      case 'profile_complete': return 'Completed your profile';
      case 'first_visit': return 'Booked your first appointment';
      default: return 'Achievement unlocked!';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="bg-gray-200 rounded-2xl h-32"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-gray-600">Track your skincare journey and achievements</p>
          </div>
          <button
            onClick={resetProgress}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset (Demo)
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Skincare Journey</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress?.streak || 0}</div>
              <div className="text-purple-100 text-sm">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress?.todayProgress.percentage || 0}%</div>
              <div className="text-purple-100 text-sm">Routine Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress?.points.toLocaleString() || 0}</div>
              <div className="text-purple-100 text-sm">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress?.achievements.length || 0}</div>
              <div className="text-purple-100 text-sm">Goals Achieved</div>
            </div>
          </div>
        </div>

        {/* Interactive Daily Routine Tracking */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today&apos;s Routine</h3>
            <div className="text-sm text-gray-500">
              {progress?.todayProgress.completed || 0} of {progress?.todayProgress.total || 3} complete
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(progress?.todayProgress.tasks || {}).map(([task, completed]) => (
              <div key={task} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={completed ? 'text-gray-900' : 'text-gray-600'}>{getTaskName(task)}</span>
                  {completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">+{getTaskPoints(task)} pts</div>
                  {!completed && (
                    <button
                      onClick={() => completeTask(task as any)}
                      className="px-3 py-1 text-xs bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress?.todayProgress.percentage || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {progress?.todayProgress.percentage || 0}% complete today
            </p>
          </div>

          {/* Completion Bonus */}
          {progress?.todayProgress.completed === 3 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                🎉 All tasks complete! Earned +{progress.streak > 0 ? '75' : '25'} points
                {progress.streak > 0 && ' (including streak bonus)'}
              </p>
            </div>
          )}
        </div>

        {/* Real Achievements */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {progress?.achievements.length ? 'Your Achievements' : 'Available Achievements'}
          </h3>
          
          {progress?.achievements.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {progress.achievements.map((achievement, i) => (
                <div key={i} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl mb-2">{getAchievementIcon(achievement)}</div>
                  <h4 className="font-semibold text-gray-900">{getAchievementTitle(achievement)}</h4>
                  <p className="text-sm text-gray-600">{getAchievementDescription(achievement)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-3xl mb-2 opacity-50">💯</div>
                <h4 className="font-semibold text-gray-500">First 100 Points</h4>
                <p className="text-sm text-gray-400">Earn your first 100 points</p>
                <div className="mt-2 text-xs text-pink-600">{100 - (progress?.points || 0)} points to go</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-3xl mb-2 opacity-50">🔥</div>
                <h4 className="font-semibold text-gray-500">Week Warrior</h4>
                <p className="text-sm text-gray-400">7-day routine streak</p>
                <div className="mt-2 text-xs text-pink-600">{7 - (progress?.streak || 0)} days to go</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-3xl mb-2 opacity-50">🛍️</div>
                <h4 className="font-semibold text-gray-500">First Purchase</h4>
                <p className="text-sm text-gray-400">Make your first purchase</p>
                <div className="mt-2 text-xs text-pink-600">Start shopping to unlock</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progress?.stats.totalOrders || 0}</div>
              <div className="text-sm text-blue-700">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{progress?.stats.totalVisits || 0}</div>
              <div className="text-sm text-green-700">Clinic Visits</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${progress?.stats.totalSpent || 0}</div>
              <div className="text-sm text-purple-700">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{progress?.stats.daysActive || 0}</div>
              <div className="text-sm text-orange-700">Days Active</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}